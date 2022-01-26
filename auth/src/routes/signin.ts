import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError, validateRequest } from '@psticketing/common';

import { User } from '../models/user';
import { Password } from '../services/password';

const router = express();

router.post('/api/users/signin',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid!'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage(`Password is required`)
    ],
    validateRequest,
    async (req: Request, res: Response) => {

        const { email, password } = req.body;

        //check if the user exists or not
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            throw new BadRequestError('Invalid Credential');
        }

        //compare the password
        const isPasswordMatch = await Password.compare(existingUser.password, password);

        if (!isPasswordMatch) {
            throw new BadRequestError('Invalid Credential');
        }

        //Generate the token
        const userJWT = jwt.sign({
            id: existingUser.id,
            email: existingUser.email
        },
            process.env.JWT_KEY! //here excalmation marks provide typescript a confident that we checked the code and confident that this variable of ENV is defined.
        );

        //Assigning this token to the cookie
        req.session = {
            jwt: userJWT
        }

        res.status(200).send(existingUser);
    });

export { router as signinRouter };
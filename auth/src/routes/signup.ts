import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { BadRequestError, validateRequest } from '@psticketing/common';

const router = express();

router.post('/api/users/signup', [
    body('email')
        .isEmail()
        .withMessage("Email must be valid"),
    body('password')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage(`Password must be between 4 and 20 character`)
], 
validateRequest,
async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const isEmailExists = await User.findOne({ email });

    if (isEmailExists) {
        throw new BadRequestError('Email already in use!!');
    }

    const user = User.build({ email, password });
    await user.save();

    //Will generate the jsonwebtoken and store in the cookieSession
    //CookieSession provides req.session object and store data on the req.session
    //and at the last send back to the browser

    //Generate the token
    const userJWT = jwt.sign({
        id: user.id,
        email: user.email
    }, 
    process.env.JWT_KEY! //here excalmation marks provide typescript a confident that we checked the code and confident that this variable of ENV is defined.
    );

    //Assigning this token to the cookie
    req.session = {
        jwt: userJWT
    }

    res.status(201).send(user);

});

export { router as signupRouter };
import express, { Request, Response } from 'express';
import { currentUser } from '@psticketing/common';
/* 
    This handler is used to get the current user is logged in or not by forwarding the cookie jwt as
    cookie jwt is not accessible in the browser we  need to make call to check if the user is logged in or not.
*/
const router = express();

router.get('/api/users/currentuser', currentUser, (req: Request, res: Response) => {
    res.send({currentUser: req.currentUser || null});
});

export { router as currentUserRouter };
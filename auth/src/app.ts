import express from 'express';
import 'express-async-errors'; //this package is used to make throw new Error work inside the async function look app.all("*")
import { json } from 'body-parser';
import cookieSession from 'cookie-session'; //We create JWT and store this on cookie it is required to get JWT at first request from browser
import { errorHandler, NotFoundError } from '@psticketing/common';

import { currentUserRouter } from './routes/current_user';
import { signinRouter } from './routes/signin';
import { signOutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';

const app = express();
app.use(json());
//trust the proxy coming from the ingress engine //https reqiured in cookie
app.set('trust proxy',true);

//use the middleware for cookie session
app.use(
    cookieSession({
        signed:false, // We are not encrypting the data in cookie as JWT is already encrypted and also other language like ruby might not support this encryption
        secure: process.env.NODE_ENV !== 'test' //send the data over https | while testing through jest we have to make it false
    })
)


app.use(currentUserRouter);
app.use(signinRouter);
app.use(signOutRouter);
app.use(signupRouter);

app.all("*", async (req, res, next) => {
    throw new NotFoundError();
});

//error handling middlewares
//This is ] middlewares provided by the express to handle the error 
//if you pass four argunments function  to the middleare app.use()like errorHandle(err, req, res, next) then it will 
//handle all the error throw by keyword throw new Error()
app.use(errorHandler);

export { app };

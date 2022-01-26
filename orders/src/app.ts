import express from 'express';
import 'express-async-errors'; //this package is used to make throw new Error work inside the async function look app.all("*")
import { json } from 'body-parser';
import cookieSession from 'cookie-session'; //We create JWT and store this on cookie it is required to get JWT at first request from browser
import { currentUser, errorHandler, NotFoundError } from '@psticketing/common';
import { indexOrderRouter } from './routes';
import { newOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';
import { deleteOrderRouter } from './routes/delete';

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
);

app.use(currentUser);
app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(deleteOrderRouter);

app.all("*", async (req, res, next) => {
    throw new NotFoundError();
});

//error handling middlewares
//This is ] middlewares provided by the express to handle the error 
//if you pass four argunments function  to the middleare app.use()like errorHandle(err, req, res, next) then it will 
//handle all the error throw by keyword throw new Error()
app.use(errorHandler);

export { app };

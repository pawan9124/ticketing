
import { BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@psticketing/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { PaymentCreatedPublisher } from '../events/publisher/payment-created-event';
import { Order } from '../models/OrderModel';
import { Payment } from '../models/payments';
import { natsWrapper } from '../nats-wrapper';
import { stripe } from '../stripe';

const router = express.Router();


router.post('/api/payments', 
    requireAuth,
    [
        body('token')
        .not()
        .isEmpty(),
        body('orderId')
        .not()
        .isEmpty()
    ],
    validateRequest
,async (req:Request, res:Response)=>{

    //get the token and the orderId from the body 
    const { token, orderId } = req.body;
    const order = await Order.findById(orderId);

    if(!order){
        throw new NotFoundError();
    }

    //This check is only for the user who create the order
    if(order.userId !== req.currentUser!.id){
        throw new NotAuthorizedError();
    }

   // if the order status is cancelled
    if(order.status === OrderStatus.Cancelled){
        throw new BadRequestError('Cannot pay for an cancelled order');
    }

    //stripe payments requires to create the stripe changes

    const charge = await stripe.charges.create({
        currency:'inr',
        amount: order.price * 100,
        source:token
    });

    /* 
        THis is just only the future reference for the payments need to be saved along with the orderId 
        to let the history for the orders.
    */
    const payment = Payment.build({
        orderId,
        stripeId:charge.id
    });

    await payment.save();

    /* 
        After saving the data pulish an event about the payment is created
    */
   new PaymentCreatedPublisher(natsWrapper.client).publish({
       id:payment.id,
       orderId:payment.orderId,
       stripeId:payment.stripeId
   });

    res.status(201).send({id:payment.id});
});

export { router as createChargeRouter };
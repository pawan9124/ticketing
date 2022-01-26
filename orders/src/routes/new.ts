import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@psticketing/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { Order } from '../models/order';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 30;

router.post(
    '/api/orders', 
    requireAuth,
    [
        body('ticketId')
        .not()
        .isEmpty()
        .custom((input:string)=> mongoose.Types.ObjectId.isValid(input)) //this will check if the provided Id is mongodb ObjectId valid one.
        .withMessage("TicketId must be provided")
    ],
    validateRequest,
    async (req: Request, res: Response)=>{
        const { ticketId } = req.body;

        //Find the ticket the user is trying to order in the database
        const ticket = await Ticket.findById(ticketId);

        if(!ticket){
            throw new NotFoundError();
        }

        //If we find an order from that means the ticket *is reserved*
        const isReserved = await ticket.isReserved();

        if(isReserved){
            throw new BadRequestError('Ticket is already reserved!')
        }

        //Calculate the expiration date for this order
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds()+ EXPIRATION_WINDOW_SECONDS);

        //Build the order and save it to the database
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket:ticket
        });

        await order.save();

        //publishing an event saying the event is created
        new OrderCreatedPublisher(natsWrapper.client).publish({
            id:order.id,
            status:order.status,
            version:order.version,
            userId:order.userId,
            expiresAt:order.expiresAt.toISOString(),
            ticket:{
                id:ticket.id,
                price:ticket.price
            }
        });

        res.status(201).send(order);
});

export { router as newOrderRouter};
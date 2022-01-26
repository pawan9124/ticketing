import { BadRequestError, NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@psticketing/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';


const router = express.Router();

router.put(`/api/tickets/:id`, requireAuth,[
    body('title')
    .not()
    .isEmpty()
    .withMessage('Provide a valid title'),
    body('price')
    .isFloat({gt:0})
    .withMessage('Provide a valid and greater than 0 price')

],validateRequest, async (req: Request, res:Response)=>{

    const ticket = await Ticket.findById(req.params.id);

    if(!ticket){
        throw new NotFoundError();
    }

    if(ticket.orderId){
        throw new BadRequestError('Cannot edit a reserved ticket!')
    }

    if(ticket.userId !== req.currentUser!.id){
        throw new NotAuthorizedError()
    }

    //here we are updating at the ticket document directly and prehooks after save will return the updated object at ticket
    ticket.set({
        title:req.body.title,
        price:req.body.price
    });

    //after update the mongodb returns the updated object in the ticket
    await ticket.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
        id:ticket.id,
        title:ticket.title,
        price:ticket.price,
        userId:ticket.userId,
        version:ticket.version
    });

    return res.status(201).send(ticket);
});

export { router as updateTicketRouter};
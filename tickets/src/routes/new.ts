 import { requireAuth, validateRequest } from '@psticketing/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-pulisher';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';
 
 const router = express.Router();

 router.post('/api/tickets',requireAuth, [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price').isFloat({gt: 0}).withMessage('Price must be greater than 0')
  ], validateRequest, async (req:Request, res: Response)=>{

      //get the title and price from the request
      const {title, price} = req.body;

      const ticket = Ticket.build({
        title,
        price,
        userId:req.currentUser!.id //providing the ! in the userId helps to make typescript understand that we handle that you can chill
      });

      await ticket.save();
      new TicketCreatedPublisher(natsWrapper.client).publish({
        id:ticket.id,
        title:ticket.title,
        price:ticket.price,
        userId:ticket.userId,
        version:ticket.version
      })

      return res.status(201).send(ticket);


 });

 export { router as createTicketRouter};
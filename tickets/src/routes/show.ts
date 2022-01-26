import { NotFoundError } from '@psticketing/common';
import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();


router.get('/api/tickets/:id',async (req: Request, res: Response)=>{

    const tickets = await Ticket.findById(req.params.id);

    if(!tickets){
        throw new NotFoundError();
    }

    return res.status(200).send(tickets);

});

export { router as showTicketRouter};
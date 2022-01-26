import { requireAuth } from '@psticketing/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response)=>{
    const orders = await Order.find({
        userId: req.currentUser!.id
    }).populate('ticket');
    console.log("RODERE---.",orders)
    res.status(200).send(orders);
});

export { router as indexOrderRouter};
import request from 'supertest';
import { app } from '../../app';
import mongoose, { mongo } from 'mongoose';
import { Order } from '../../models/OrderModel';
import { OrderStatus } from '@psticketing/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payments';

jest.mock('../../stripe');

it('returns a 404 when purchasing an order that does not exists', async ()=>{
    await request(app)
        .post('/api/payments')
        .set("Cookie", global.signin())
        .send({
            token:'xmxmxmmxmxmxm',
            orderId:new mongoose.Types.ObjectId().toHexString()
        }).expect(404);
});

it('returns a 401 when the order does not belong to the user', async()=>{
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        version:0,
        price:20,
        status:OrderStatus.Created
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set("Cookie", global.signin())
        .send({
            token:'xmxmxmxmxmmx',
            orderId:order.id
        }).expect(401);
});

it('returns 400 if the user pay for cancelled Orders', async()=>{

    //create a user Id
    const userId = new mongoose.Types.ObjectId().toHexString();

    //create a cancelled order
    const order = Order.build({
        id:new mongoose.Types.ObjectId().toHexString(),
        version:0,
        price:20,
        userId:userId,
        status:OrderStatus.Cancelled
    });

    await order.save();

    await request(app)
        .post('/api/payments')
        .set("Cookie", global.signin(userId))
        .send({
            token:'mxmxmxmxxmxmxm',
            orderId:order.id
        }).expect(400);

});

it('returns 201 when charged stripe with valid inputs', async ()=>{

    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version:0,
        price:20,
        status:OrderStatus.Created
    });
    await order.save();

    await request(app).
        post('/api/payments')
        .set("Cookie",global.signin(userId))
        .send(
            {
            token: 'tok_visa',
            orderId: order.id
        }
        ).expect(201);

    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(chargeOptions.source).toEqual('tok_visa');
    expect(chargeOptions.amount).toEqual(20 * 100);
    expect(chargeOptions.currency).toEqual('inr');

    const payment = await Payment.findOne({
        orderId:order.id
    });

    expect(payment).not.toBeNull();
    expect(payment!.stripeId).toBeDefined();
})
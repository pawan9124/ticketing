import mongoose from "mongoose";
import request from 'supertest';
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it('return an error if the tciket does not exits', async ()=>{
    const ticketId = new mongoose.Types.ObjectId();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId})
        .expect(404)
});

it('return an error if the ticket is already reserved', async ()=>{
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price:20
    });

    await ticket.save();

    const order = Order.build({
        ticket,
        userId:'xmxmxmxmxmmxmxm',
        status:OrderStatus.Created,
        expiresAt:new Date()
    });

    await order.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId:ticket.id
        }).expect(400);

});

it('return 201 when an ticket is reserved', async ()=>{
    //create a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'Football',
        price:20
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId:ticket.id})
        .expect(201);

});

it('emit an event when an order is created!', async()=>{
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'Football',
        price:20
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId:ticket.id})
        .expect(201);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})
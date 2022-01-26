import { Ticket } from "../../models/ticket";
import request from 'supertest';
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";
import mongoose from 'mongoose';

it('should cancel the order',async ()=>{
    //create a ticket 

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'concert',
        price:20
    });

    ticket.save();
    //creaet an order

    const user = global.signin();

    const {body:order} = await request(app).post('/api/orders').set("Cookie",user).send({ticketId:ticket.id}).expect(201);

    //cancel the order 
    const {body:canceledOrder} = await request(app)
        .delete(`/api/orders/${order.id}`)
        .set("Cookie",user)
        .send()
        .expect(204);

    //make sure order is cancelled

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it("emit an event of an ordered cancelled", async ()=>{

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'concert',
        price:20
    });

    ticket.save();
    //creaet an order

    const user = global.signin();

    const {body:order} = await request(app).post('/api/orders').set("Cookie",user).send({ticketId:ticket.id}).expect(201);

    //cancel the order 
    const {body:canceledOrder} = await request(app)
        .delete(`/api/orders/${order.id}`)
        .set("Cookie",user)
        .send()
        .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

})
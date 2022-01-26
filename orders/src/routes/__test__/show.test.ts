import { Ticket } from "../../models/ticket";
import request from 'supertest';
import { app } from "../../app";
import mongoose from 'mongoose';

it('should return the order fetched by orderId', async()=>{

    //create a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'Snake',
        price:20
    });

    await ticket.save();

    const user = global.signin();

    // create an order
    const {body:order} = await request(app)
        .post('/api/orders')
        .set("Cookie",user)
        .send({ticketId:ticket.id})
        .expect(201);

    //get the request from show
    const response = await request(app)
        .get(`/api/orders/${order.id}`)
        .set("Cookie",user)
        .send()
        .expect(200);

    expect(response.body.id).toEqual(order.id);
                    
});

it('return a 401 when other user tired to access the other orders', async ()=>{
    //create a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'Snake',
        price:20
    });

    await ticket.save();

    const user = global.signin();

    // create an order
    const {body:order} = await request(app)
        .post('/api/orders')
        .set("Cookie",user)
        .send({ticketId:ticket.id})
        .expect(201);

    //get the request from show
    const response = await request(app)
        .get(`/api/orders/${order.id}`)
        .set("Cookie",global.signin())
        .send()
        .expect(401);

});
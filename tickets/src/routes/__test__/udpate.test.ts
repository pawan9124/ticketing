import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('returns a 404 if the provided id does not exists', async ()=>{
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
        title:'cricket',
        price:20
    }).expect(404);
});

it('returns 401 if the user is not authenticated', async ()=>{
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
    .put(`/api/tickets/${id}`)
    .send({
        title:'cricket',
        price:20
    }).expect(401);
});

it('returns a 401 if the user does not own the ticket', async ()=>{
    const response = await request(app)
        .post('/api/tickets')
        .set("Cookie", global.signin())
        .send({
            title:'kingkong',
            price:30
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", global.signin())
        .send({
            title:'PingPong',
            price:40
        }).expect(401);
        
});

it('returns a 400 if the title or price is invalid', async ()=>{
    const cookie = global.signin();

    const response = await request(app)
    .post('/api/tickets')
    .set("Cookie", cookie)
    .send({
        title:"King Kong",
        price:20
    });


    //check for the invalid title
    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie",cookie)
    .send({
        title:'',
        price:20
    }).expect(400);

    //check for the price invalid
    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie",cookie)
    .send({
        title:'Kinign',
        price:-20
    }).expect(400);

});

it('return 201 if the ticket is updated successfully',async ()=>{

    const cookie = global.signin();

    const response = await request(app)
    .post('/api/tickets')
    .set("Cookie", cookie)
    .send({
        title:"King Kong",
        price:20
    });

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
        title:'pigbilla',
        price:100
    });

    const ticketResponse = await request(app).get(`/api/tickets/${response.body.id}`).send();

    expect(ticketResponse.body.title).toEqual('pigbilla');
    expect(ticketResponse.body.price).toEqual(100);

});

it('it will publish the ticket update event',async()=>{
    const cookie = global.signin();

    const response = await request(app)
    .post('/api/tickets')
    .set("Cookie", cookie)
    .send({
        title:"King Kong",
        price:20
    });

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
        title:'pigbilla',
        price:100
    });

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('reject an update request is the ticket is reserved', async ()=>{
    const cookie = global.signin();

    const response = await request(app)
    .post('/api/tickets')
    .set("Cookie", cookie)
    .send({
        title:"King Kong",
        price:20
    });

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({orderId:new mongoose.Types.ObjectId().toHexString()});
    await ticket?.save();

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
        title:'pigbilla',
        price:100
    }).expect(400);

})

import { Ticket } from "../../models/ticket"
import request from 'supertest';
import { app } from "../../app";
import mongoose from 'mongoose';
 
const buildTicket = async ()=>{
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'Concert',
        price:200
    });
    await ticket.save();
    return ticket;
}

it('get the orders for a particular user',async()=>{

    //create 3 tickets and get the ticket id
    const ticketOne = await buildTicket();
    const ticketTwo = await buildTicket();
    const ticketThree = await buildTicket();

    //Sigin as two users
    const userOne = global.signin();
    const userTwo = global.signin();

    //Create the order for user1
    await request(app)
        .post('/api/orders')
        .set("Cookie",userOne)
        .send({ticketId:ticketOne.id})
        .expect(201);

      //Create the order for user2
      //renaming body to orderOne
     const {body:orderOne}= await request(app)
      .post('/api/orders')
      .set("Cookie",userTwo)
      .send({ticketId:ticketTwo.id})
      .expect(201);
      //Create the order for user2
      const {body:orderTwo} = await request(app)
      .post('/api/orders')
      .set("Cookie",userTwo)
      .send({ticketId:ticketThree.id})
      .expect(201);

      //Make a call get the response for the user2
      const response = await request(app).get('/api/orders').set("Cookie",userTwo).expect(200);

      //Make sure we only get the orders for user #2
      expect(response.body.length).toEqual(2);
      expect(response.body[0].id).toEqual(orderOne.id);
      expect(response.body[1].id).toEqual(orderTwo.id);
      expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
      expect(response.body[1].ticket.id).toEqual(ticketThree.id);
})
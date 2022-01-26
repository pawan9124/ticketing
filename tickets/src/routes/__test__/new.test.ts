import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper'; //here the actual nats wrapper is called but the jest.mock will provide only the mocked version as override its


it("has a route handler listening to /api/tickets for post requests", async ()=>{
    const response = await request(app).post('/api/tickets').send({});
    expect(response.status).not.toEqual(404);
});

it('check if user not signed in then expect 401', async ()=>{
    await request(app).post('/api/tickets').send({}).expect(401);
});

it("it should return status other than 401 if the user is signedIn", async ()=>{
    const response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({});
    expect(response.status).not.toEqual(401);
});


it('return an error if an invalid title is provided', async ()=>{
    await request(app).post("/api/tickets").set("Cookie",global.signin()).send({
        title:'',
        price:30
    }).expect(400);

    await request(app).post('/api/tickets').set("Cookie", global.signin()).send({
        price:10
    }).expect(400);
});

it('returns an error if an invalid price is provided', async ()=>{
    await request(app).post("/api/tickets").set("Cookie",global.signin()).send({
        title:'golf club',
        price:-10
    }).expect(400);

    await request(app).post('/api/tickets').set("Cookie", global.signin()).send({
        title:'glofclub'
    }).expect(400);
});

it('creates a ticket when the valid data is provided', async()=>{
    //In the before hooks all the data from the database is deleted
    let tickets = await Ticket.find({});

    //check if the tickets are really empty or not
    expect(tickets.length).toEqual(0);

    const title = "golfclub";
    //Add in a check to make sure the ticket was created
    await request(app).post('/api/tickets').set("Cookie", global.signin()).send({
        title,
        price:20
    }).expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].price).toEqual(20);
    expect(tickets[0].title).toEqual(title);
});

it('it should publish the events for ticket creation', async()=>{

    const title = "golfclub";
    //Add in a check to make sure the ticket was created
    await request(app).post('/api/tickets').set("Cookie", global.signin()).send({
        title,
        price:20
    }).expect(201);
    console.log("FJFJFJ")
    expect(natsWrapper.client.publish).toHaveBeenCalled();

});
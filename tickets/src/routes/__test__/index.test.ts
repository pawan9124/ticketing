import request from 'supertest';
import { app } from '../../app';

const createTickets = ()=>{
    return request(app).post('/api/tickets')
    .set("Cookie",global.signin())
    .send({
        title:'Football',
        price:10
    })
}

it('returns 200 and information about the tickets', async ()=>{
    await createTickets();
    await createTickets();
    await createTickets();

    const response = await request(app).get('/api/tickets').send({});
    expect(response.body.length).toEqual(3);
});
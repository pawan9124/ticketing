import request from 'supertest';
import { app } from '../../app';

it('fetch the details of the current logged in user', async ()=>{
    const cookie = await global.signin();

    
    const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie',cookie)
    .send()
    .expect(200);

    expect(response.body.currentUser.email).toEqual('test@test.com')
});

it('it responds with null when the user is unauthorized', async ()=> {
    const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);

    expect(response.body.currentUser).toEqual(null);
})
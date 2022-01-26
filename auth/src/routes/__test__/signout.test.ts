import request from 'supertest';
import { app } from '../../app';

it('clears the cookie on signout request', async()=>{
    await request(app)
        .post('/api/users/signup')
        .send({
            email:'test@test.com',
            password:'password'
        })
        .expect(201);

    const response = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);

    //you can make Set-Cookie toBeDefined check or compare with thsi string it will hope never change
    expect(response.get('Set-Cookie')[0]).toEqual('session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly')
})
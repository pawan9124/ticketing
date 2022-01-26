import request from "supertest";
import { app } from "../../app";

it('it responds with failed as email dont exists', async ()=>{
    await request(app)
        .post('/api/users/signin')
        .send({
            email:'test@test.com',
            password:'password'
        })
        .expect(400);
});

it('responds with 400 as password is not valid', async ()=>{

    //signup first
    await request(app)
        .post('/api/users/signup')
        .send({
            email:'test@test.com',
            password:'password'
        })
        .expect(201);

        await request(app)
        .post('/api/users/signin')
        .send({
            email:'test@test.com',
            password:'xxxx'
        })
        .expect(400);
});

it('responds with a valid cookie on signin', async()=>{
    await request(app)
        .post('/api/users/signup')
        .send({
            email:'test@test.com',
            password:'password'
        })
        .expect(201);

        const response = await request(app)
        .post('/api/users/signin')
        .send({
            email:'test@test.com',
            password:'password'
        })
        .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
})

import request from 'supertest';
import { app } from '../../app';

it('return a 201 on successful signup', async ()=> {
    return request(app)
        .post('/api/users/signup')
        .send({
            email:'test@test.com',
            password:'password'
        })
        .expect(201);
});

it('return a 400 on invalid email', async ()=> {
    return request(app)
        .post('/api/users/signup')
        .send({
            email:'testtest.com',
            password:'password'
        })
        .expect(400);
});

it('return a 400 on invalid password', async ()=> {
    return request(app)
        .post('/api/users/signup')
        .send({
            email:'test@test.com',
            password:'p'
        })
        .expect(400);
});

it('return a 400 on missing email and password', async ()=> {

    //you can use the await instead of return 
    await request(app)
        .post('/api/users/signup')
        .send({
            password:'password'
        })
        .expect(400);

        await request(app)
        .post('/api/users/signup')
        .send({
            email:'test@test.com',
        })
        .expect(400);
});


it('disallow the duplicates email', async ()=> {

    //you can use the await instead of return 
    await request(app)
        .post('/api/users/signup')
        .send({
            email:'test@test.com',
            password:'password'
        })
        .expect(201);

        await request(app)
        .post('/api/users/signup')
        .send({
            email:'test@test.com',
            password:'password'
        })
        .expect(400);
});

//check the header returns the cookie set or not since we setup cookie to be sent over https 
//we have to disable it by putting process.env.NODE_ENV !== test then true else false

it('check the set-cookie to be defined', async ()=> {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email:'test@test.com',
            password:'password'
        })
        .expect(201);
    
    expect(response.get('Set-Cookie')).toBeDefined();
})

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

//to add additional properties to existing object use declare syntax
//here sigin is adding to the global object
declare global {
    var signin: () => Promise<string[]>;
  }

//this hook will run before all the hooks
//here we are connecting to the in memory mongo server for testing purpose
let mongo:MongoMemoryServer;

beforeAll( async ()=>{
    //setting the environment before the hook run
    process.env.JWT_KEY = 'abrakadabra';
     mongo = new MongoMemoryServer();
     await mongo.start();
    const mongoUri = await mongo.getUri(); //get the uri from the in memory server
    await mongoose.connect(mongoUri); //connecting to the mongodb
})

// this hook will run before each test
beforeEach(async ()=>{
    //here we are clearing the data from the documents before running our tests
    const collections = await mongoose.connection.db.collections();

    for(let collection of collections){
        await collection.deleteMany({});
    }
})

//After all tests are run, need to close the connection

afterAll(async ()=>{
    await mongo.stop();
    await mongoose.connection.close();
});

//declaring the global function around to make the signin request reusable

global.signin = async ()=>{
    const email = 'test@test.com';
    const password = 'password';

    const response = await request(app).
    post('/api/users/signup')
    .send({
        email, password
    })
    .expect(201);
    const cookie = response.get('Set-Cookie');
    return cookie;
}
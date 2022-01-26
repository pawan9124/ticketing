import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

//to add additional properties to existing object use declare syntax
//here sigin is adding to the global object
//if you use the async keyword then provide the Promise<string[]> as return type
declare global {
    var signin: () => string[];
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
});
//This jest mock on the setup file will tell every test to use the mock function 
jest.mock('../nats-wrapper.ts');

// this hook will run before each test
beforeEach(async ()=>{
    jest.clearAllMocks();//this will clear the data from the mocks before calling each test.
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

global.signin =  ()=>{
    /* 
        Here like in the auth service we can call the signup function and return the cookie for testing
        but here we can't access the sigup route and we should not do by calling the service name 'auth-service-name'
        we will create a fake cookie using JWT and sent to set cookie and validate the testing.
    */

        //create the payload as payload contains only email and id
        const payload = {
            id:new mongoose.Types.ObjectId().toHexString(),
            email:'test@test.com'
        }

        //create the jwt;
        const token = jwt.sign(payload, process.env.JWT_KEY!);

        //build the sesion json 
        const session = {jwt:token};

        //Turn the session into JSON
        const sessionJSON = JSON.stringify(session);

        //Take JSON and encode in the base64
        //Here base64 convert the binary data into string of 64 characters, which helps to transfer the stringify data without corruption
        // in the middle of the data
        const base64 = Buffer.from(sessionJSON).toString('base64');

        //return the cookie, as the cookie structure is cookie:express:sess='base64 data'
        return [`session=${base64}`];

}
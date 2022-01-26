import mongoose, { mongo } from 'mongoose';
import { app } from './app';

const start = async () => {
    console.log("Stating up Auth....")
    //Here checking if the process.env variables are defined in the start of application as it will complain in the middle when app is running
    if(!process.env.JWT_KEY){
        throw new Error('JWT_KEY must be present in the enviornment');
    }

    //checking if the mongouri is present or not
    if(!process.env.MONGO_URI){
        throw new Error('MONGO_URI is not defined in the environment');
    }
    try {
        //auth-mongo-srv is the service name of the auth-mongo where mongodb reside inside the pod
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to the mongodb")
    } catch (err) {
        console.error(err);
    }
    app.listen(3000, () => console.log("Auth Service is listening on the port 3000!!!!!!!"));
}

start();

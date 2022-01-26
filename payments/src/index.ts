import mongoose, { mongo } from 'mongoose';
import { app } from './app';
import { OrderCancelledListener } from './events/listeners/OrderCancelledListener';
import { OrderCreatedListener } from './events/listeners/OrderCreatedListener';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
    console.log("Starting the payments services...")
    //Here checking if the process.env variables are defined in the start of application as it will complain in the middle when app is running
    if(!process.env.JWT_KEY){
        throw new Error('JWT_KEY must be present in the enviornment');
    }

    if(!process.env.MONGO_URI){
        throw new Error('MONGO_URI environment is required!');
    }
    if(!process.env.NATS_CLIENT_ID){
        throw new Error('NATS_CLIENT_ID environment is required!');
    }
    if(!process.env.NATS_URL){
        throw new Error('NATS_URL environment is required!');
    }
    if(!process.env.NATS_CLUSTER_ID){
        throw new Error('NATS_CLUSTER_ID environment is required!');
    }
    try {
        //nats-srv is the service name of the nats deployment which is listening on the port 4222
        // 'here ticketing is the clusterId, defined in the nats deployment at args last, used to identify the cluster on which the nats is hosted
        //then clientId is the ID used to maintain a connection ID connected to the nats
        //
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL);

        //We are using the on close connection here as connection on close not should be get closed inside a class by any method
        natsWrapper.client.on('close',()=>{
            console.log("Listener is closed from NATS!!");
            process.exit();
        });
        process.on('SIGINT', ()=> natsWrapper.client.close());
        process.on('SIGTERM',()=> natsWrapper.client.close());

        //listen for the listenere
        new OrderCancelledListener(natsWrapper.client).listen();
        new OrderCreatedListener(natsWrapper.client).listen();

        //auth-mongo-srv is the service name of the auth-mongo where mongodb reside inside the pod
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to the mongodb")
    } catch (err) {
        console.error(err);
    }
    app.listen(3000, () => console.log("Tickets Service is listening on the port 3000!!!!!!!"));
}

start();

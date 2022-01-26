import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
    //Here checking if the process.env variables are defined in the start of application as it will complain in the middle when app is running
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

        new OrderCreatedListener(natsWrapper.client).listen();

    } catch (err) {
        console.error(err);
    }
}

start();

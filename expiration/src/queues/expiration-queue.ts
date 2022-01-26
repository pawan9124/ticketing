import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { natsWrapper } from '../nats-wrapper';

//Queue in bull is used to create a job which could be stored in the redis server and after 15 min it will 
//repond with an event the expiration is complete.

interface Payload {
    orderId:string;
}

const expirationQueue = new Queue<Payload>('order:expiration',{
    redis:{
        host: process.env.REDIS_HOST
    }
});

expirationQueue.process(async (job)=>{
    new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId:job.data.orderId
    })
});

export {expirationQueue};
import nats  from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-create-listener';

console.clear();

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'),{
    url:'http://localhost:4222'
});

stan.on('connect',()=>{
    console.log("Listeing on Connect to NATS");

    //Here we are cancelling the client as on restart and close a client the nats server waiting for some time to check client to backup again, but we don't want
    //that wait we want to immediately close it for that we write code here

    stan.on('close',()=>{
        console.log("Listener is closed from NATS!!");
        process.exit();
    })

    //REFERS TO THE OPTION CHAINING
    //this options is created by chaining process, so to add new option has to chain new function of option here setManualAck is set
    //setManualAckMode will wait for the event to complete and if setAck manually in the event listener is not present then it will send the
    //event to the other service if present in queuegroup, if nothing found try with the present one in 30 sec
    //last two options will be used to send events incase there is drop of listener and can't processed it fully.
     //set deliverallAvailable is the option used to send all event history to the listeners when the listener restarts so we can get history
    //setDurablename will send events from history only when the listener is down for some and the events not get processed, but we still use allDeliverable to send
    //the events when the events is present and the service is up for first time else it will be ignored.

    //those who run this listener npm run listen file will be in the group of the orders-service-queue-group
    /* 
        * There is  a gotcha here if we not provide the queue group which is here the orders-service-queue-group`, then if restart the service 
        then NATS thinks the service is down and dump all the event history and we gonna loose the event history, but if we provide the queue group
        then we will not see event dump cause the NATS will preserved the history even for single instance
        ********* So these three things required to get the services to preserve EVENT History ***************
        1.setDeliverAllAvailable
        2. setDurableName
        3. Queue group
    */
        //'orders-service-queue-group', //this second args is about to create queuegroup means if some listener are in queue group then only one of them will receive the event message and rest will not
        //so it will help to not allow duplicate entry of some query present in two services

        //creat the ticket listener and listen to the events
        new TicketCreatedListener(stan).listen()

});

//Here we are listening two events of process terminate and process interrupted and fire event to close the client
process.on('SIGINT', ()=> stan.close());
process.on('SIGTERM',()=> stan.close());




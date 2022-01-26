/* 
*************************** Abstract Class for the Listeners **************************
//The subclass created from the abstract subclass is like OrderServiceListener or TicketServiceListener
//They will implement the same structure and modified the code according to them
*/

/* 
============================================================================================================
    ** DOCS about the QUEUE_GROUP_NANE
     -> Queue group name is used to deliver the event only to one of the many services subscribe to the subject
     - > This will allow to load balance the events effeciently not all listener will receive the events
     -> Queue group is also required in the event History as without event history the NATS will dump all the events whenever
        the service gets down for fraction of time, so by providing the group name we will prevent it from the dumping of event history
    
*/

import {Stan, Message} from 'node-nats-streaming';
import { Subjects } from './subjects';

//To be a listener you should have these kind of events present in your object
interface Event {
    subject:Subjects,
    data:any
}

/* 
    Here we are creating the generic class , generic means can be think of reusable function where the argument is passed
    and the argument will contain the data passed by the caller.
    T['subject'], the subject will of type Subject(ticket:created|| order:created)
*/
export abstract class Listener <T extends Event>{ 
    abstract subject: T['subject']; //This is the subject which is used to create the channel in the NATS and used as identifier for the events
    abstract queueGroupName: string; //Queue Group name helps to maintain the sending of the events to the listeners only one if available for more Ref above section **Group Name
    abstract onMessage(data:T['data'], msg: Message): void;
    private client!: Stan;
    protected ackWait = 5 * 1000; //the subclass can also modify the ackWait time currently it is 30 sec default

    //user have to pass the client when the 
    constructor(client:Stan){
        this.client = client;
    }

    subscriptionOptions(){
        return this.client
        .subscriptionOptions() //the options are set by the chaining process
        .setDeliverAllAvailable() // this option will provide all the event history at once when events are passed and services starts for the first time.
        .setManualAckMode(true) //this option will wait for the manula acknowledgement of the event
        .setAckWait(this.ackWait)//this is the time expiration for the wait of the events in NATS
        .setDurableName(this.queueGroupName); //this options is set with a name to NATS which helps to return the events only which are not processed during the service failure
    }

    //This function will start the listening for the events
    listen(){
        const subscription = this.client.subscribe(
            this.subject, //first args is the subject where we have subscribe
            this.queueGroupName, //second args is the queueGroupName, optional if not passed then the listener will always receive the events not load balancing
            this.subscriptionOptions() //the subscription options
        ); //subscribe to the subject and listen

        subscription.on('message',(msg: Message)=>{
            console.log(
                `Message Received: ${this.subject}/ ${this.queueGroupName}`
            );
            const parsedData = this.parseMessage(msg);
            this.onMessage(parsedData, msg);
        });
    }

    parseMessage(msg:Message){
        const data = msg.getData(); //this is the method to retrieve the data from the msg
        return typeof data === 'string'
        ? JSON.parse(data) //parse the string
        : JSON.parse(data.toString('utf8')); //parse the buffer
    }


}

import { Message } from "node-nats-streaming";
import { Listener } from "./base-listener";
import { Subjects } from "./subjects";
import { TicketCreatedEvent } from "./ticket-created-event";

/* 
    Here the Listener is generic type, think of it like a function which accepts the arguments and force the class to behave according to arguments
    TicketCreateEvent is the argument passed to the generic class which has subjectType and dataType
*/
export class TicketCreatedListener extends Listener<TicketCreatedEvent>{
    readonly subject = Subjects.TicketCreated;
    queueGroupName = 'payments-service';
    onMessage(data: TicketCreatedEvent["data"], msg: Message) {
        console.log("Id--->",data.id);
        console.log("Title--->",data.title);
        console.log("PRICE--->",data.price);
        msg.ack();
    }
}
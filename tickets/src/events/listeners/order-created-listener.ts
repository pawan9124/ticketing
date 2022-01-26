import { Listener, OrderCreatedEvent, Subjects } from "@psticketing/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";


export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    readonly  subject= Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent["data"], msg: Message){
        //Find the ticket that the roder is reserving
        const ticket = await Ticket.findById(data.ticket.id);

        //If no ticket, throw error
        if(!ticket){
            throw new Error("Ticket not found");
        }

        //Mark the ticket as being the reserved by setting its orderId property
        ticket.set({orderId: data.id});

        //save the ticket
        await ticket.save();

        //Publishing the event to the order service for the ticket update to make it version same update whenever the ticket 
        //get saved the in the upper case the mongoose-if-current-update library will update the version of the ticket and need to 
        //sync that version to the ticket in the order service
        new TicketUpdatedPublisher(this.client).publish({
            id:ticket.id,
            version:ticket.version,
            title:ticket.title,
            price:ticket.price,
            userId:ticket.userId,
            orderId:ticket.orderId
        });

        //ack the message
        msg.ack();
    }
}
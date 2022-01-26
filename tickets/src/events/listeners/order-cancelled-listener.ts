import { Listener, OrderCancelledEvent, Subjects } from "@psticketing/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent["data"], msg: Message){
        const ticket = await Ticket.findById(data.ticket.id);

        if(!ticket){
            throw new Error('Ticket Not Found');
        }

        ticket.set({orderId:undefined}); ///remember the null is not work well with the typescript
        await ticket.save();
        //remember this.client is because we make the client property in the base listener as protected, so 
        //it will be accessible by the child class
        await new TicketUpdatedPublisher(this.client).publish({
            id:ticket.id,
            orderId: ticket.orderId,
            userId:ticket.userId,
            price:ticket.price,
            title: ticket.title,
            version:ticket.version
        });

        msg.ack();
    }
}
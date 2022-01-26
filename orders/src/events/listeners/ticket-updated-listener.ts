import { Listener, Subjects, TicketCreatedEvent, TicketUdpatedEvent } from "@psticketing/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "../queue-group-name/queueGroupName";


export class TicketUpdatedListener extends Listener<TicketUdpatedEvent>{
    readonly subject = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data:TicketUdpatedEvent["data"], msg:Message){
        const {id, title, price , version}  = data;

        /* 
            We are checking if lower version is present or not, suppose version saved in db is 1 and at update
            we recieve the version 2, then version= version-1 will check in the db and the mongoose-if-update-current
            plugin will verify this not an outdated version we are looking means, suppose 1 is saved, 2 came ,then 2-1 =1 (means not outdated),
            if 1 came then 1-1=0 outdated and if 3 came , 3-1=2 (not present outdated) so it will throw error
            * But at the save time this plugin will increment by 1 , so at save time the current version will become 2 again.

        */
       const ticket = await Ticket.findByEvent(data);

        if(!ticket){
            throw new Error('Ticket Not found');
        }

         ticket.set({title, price});
        await ticket.save();

        msg.ack();
    }
}
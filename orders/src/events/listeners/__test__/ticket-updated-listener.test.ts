import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper"
import { TicketUpdatedListener } from "../ticket-updated-listener";
import mongoose from 'mongoose';
import { TicketUdpatedEvent } from "@psticketing/common";
import { Message } from 'node-nats-streaming';

const setup = async ()=>{

    //Create a listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    //Create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'conert',
        price:30
    });

    await ticket.save();

    //create a fake object data for the udpate event
    const data:TicketUdpatedEvent["data"] = {
        id: ticket.id,
        version: ticket.version +1,
        title:'Updated Concert',
        price:100,
        userId:'22dkdkdmck'
    };

    //create the message ack
    //@ts-ignore
    const msg:Message = {
        ack:jest.fn()
    }

    //return the object
    return { listener, ticket, data, msg};
}

it('find, updates, and savees a ticket', async()=>{
    const { msg, data, ticket, listener } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('msg ack function have been called', async ()=>{
    const { msg, data, listener } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async ()=>{
    const { msg, data, listener} = await setup();

    data.version = 10;

    //prevent this test from throwing the error inside
    try{
        await listener.onMessage(data, msg);
    }catch(err){
        
    }

    expect(msg.ack).not.toHaveBeenCalled();
})
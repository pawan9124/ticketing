import { OrderCreatedEvent, OrderStatus } from "@psticketing/common";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async () => {
    //Create an instance of the listener

    const listener = new OrderCreatedListener(natsWrapper.client);

    //Create  and save a ticket
    const ticket = Ticket.build({
        title: 'Concert',
        price: 30,
        userId: 'xxmxxx'
    });

    await ticket.save();

    //create the fake data event
    const data: OrderCreatedEvent["data"] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'mxxxmxmxm',
        expiresAt: 'xmxmxmmxmx',
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }

    //@ts-ignore
    const msg:Message  ={
        ack:jest.fn()
    }

    return { listener, ticket, data, msg };
}

it('sets the userId of the ticket', async ()=>{
    const { listener, ticket, data, msg} = await setup();

    await listener.onMessage(data, msg);

    const udpatedTicket = await Ticket.findById(ticket.id);

    expect(udpatedTicket!.orderId).toEqual(data.id);
});

it('ack the message', async ()=>{
    const { listener, ticket, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async ()=>{

    const { listener, ticket, data, msg} = await setup();
    await listener.onMessage(data, msg);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    
});

it('publishes a ticket updated event', async ()=>{
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    //checking if the natsWrapper is published or not by if the function is called or not
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    //get the data out of the published data
    //Since here natsWrapper is a mock defined in the __mock__ file and inisde client there is publish button
    //So the publish will verify if the data is passed or not.
    const parsedData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    //now to verify the parsed data
    expect(data.id).toEqual(parsedData.orderId);

});

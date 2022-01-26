import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper"
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import mongoose from 'mongoose';
import { Order } from "../../../models/order";
import { ExpirationCompleteEvent, OrderStatus } from '@psticketing/common';
import { Message } from "node-nats-streaming";

const setup = async()=>{
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price:20
    });

    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        userId:'xmxmxmmxmx',
        expiresAt: new Date(),
        ticket,
    });

    await order.save();

    const data: ExpirationCompleteEvent["data"] = {
        orderId: order.id
    }

    //@ts-ignore
    const msg:Message ={
        ack:jest.fn()
    }

    return { listener, order, ticket, data, msg }
}

it("udpates the order status to the cancelled", async ()=>{
    const { listener, order, ticket, data, msg} = await setup();

    await listener.onMessage(data, msg);

    const updateOrder = await Order.findById(order.id);
    expect(updateOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('publish an OrderCancelled event', async ()=>{

    const { listener, order, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(eventData.id).toEqual(order.id);
});

it('ack the message', async ()=>{
    const { listener, order, ticket, data, msg} = await setup();

    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
})
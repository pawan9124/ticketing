import { OrderCreatedEvent, OrderStatus } from "@psticketing/common";
import { natsWrapper } from "../../nats-wrapper"
import { OrderCreatedListener } from "../listeners/OrderCreatedListener";
import mongoose from 'mongoose';
import { Message } from "node-nats-streaming";
import { Order } from "../../models/OrderModel";

const setup = async ()=>{
    const listener = new OrderCreatedListener(natsWrapper.client);

    const data:OrderCreatedEvent["data"] = {
        id:new mongoose.Types.ObjectId().toHexString(),
        version:0,
        expiresAt:'slslsls',
        userId:'xmxmxmmx',
        status:OrderStatus.Created,
        ticket:{
            id:'xmsmsx',
            price:10
        }
    }

    //@ts-ignore
    const msg: Message = {
        ack:jest.fn()
    }

    return { data, listener, msg};
}

it('replicates the order info', async ()=>{
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);

    expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async ()=>{
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})
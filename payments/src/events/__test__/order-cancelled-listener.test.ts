import { natsWrapper } from "../../nats-wrapper"
import { OrderCancelledListener } from "../listeners/OrderCancelledListener";
import mongoose from 'mongoose';
import { Order } from "../../models/OrderModel";
import { OrderCancelledEvent, OrderCreatedEvent, OrderStatus } from "@psticketing/common";
import { Message } from "node-nats-streaming";

const setup = async ()=>{

    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version:0,
        status:OrderStatus.Created,
        userId:'xlxlxlx',
        price:10
    });

    await order.save();

    const data: OrderCancelledEvent["data"] = {
        id: order.id,
        version: 1, 
        ticket:{
            id:"xmxmxmxm"
        }
    }

    //@ts-ignore
    const msg: Message = {
        ack:jest.fn()
    }

        return { listener, data, msg, order}
}

it('message have been updated', async ()=>{
    const { listener, data, msg, order } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

});

it('acks the message', async ()=>{
    const {listener, data ,msg , order} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})
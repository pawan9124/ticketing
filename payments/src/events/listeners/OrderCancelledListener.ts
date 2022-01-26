import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from "@psticketing/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/OrderModel";
import { queueGroupName } from "./queueGrroupName";

export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
    readonly subject = Subjects.OrderCancelled;
    queueGroupName =    queueGroupName;

    async onMessage(data: OrderCancelledEvent["data"], msg: Message){
        const order = await Order.findOne({
            _id:data.id,
            version:data.version-1
        });

        if(!order){
            throw new Error('Order Not found');
        }

        order.set({status: OrderStatus.Cancelled});

        await order.save();

        msg.ack();
    }
}
import { Listener, NotFoundError, OrderStatus, PaymentCreatedEvent, Subjects } from "@psticketing/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "../queue-group-name/queueGroupName";


export class PaymentCreateListener extends Listener<PaymentCreatedEvent>{
    readonly subject = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;

    async onMessage(data:PaymentCreatedEvent["data"], msg: Message){
        const order = await Order.findById(data.orderId);

        if(!order){
            throw new Error(`Order Not Found`);
        }

        order.set({
            status: OrderStatus.Completed
        });

        await order.save();

        msg.ack();
    }
}
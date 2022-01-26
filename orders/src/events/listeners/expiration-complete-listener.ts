import { ExpirationCompleteEvent, Listener, OrderStatus, Subjects } from "@psticketing/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { queueGroupName } from "../queue-group-name/queueGroupName";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent>{
    readonly subject =Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message){

        //find the order and mark its status as cancelled
        const order = await Order.findById(data.orderId).populate('ticket');

        if(!order){
            throw new Error('Order Not found');
        }

        if(order.status === OrderStatus.Completed){
            return msg.ack();
        }

        order.set({
            status: OrderStatus.Cancelled
        });

        //we are not setting order null here cause we will retain per order which ticket is cancelled to show users history

        await order.save();

        await new OrderCancelledPublisher(this.client).publish({
            id:order.id,
            version:order.version,
            ticket:{
                id: order.ticket.id
            }
        });

        msg.ack();
    }
}
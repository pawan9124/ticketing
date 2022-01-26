import { Subjects, Publisher, OrderCancelledEvent } from "@psticketing/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    readonly subject  = Subjects.OrderCancelled;
}
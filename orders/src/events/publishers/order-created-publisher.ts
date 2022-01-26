import { OrderCreatedEvent, Publisher, Subjects } from "@psticketing/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    readonly subject = Subjects.OrderCreated;
}
import { PaymentCreatedEvent, Publisher, Subjects } from "@psticketing/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    readonly subject = Subjects.PaymentCreated;
    
}
import { Publisher, Subjects, TicketCreatedEvent } from "@psticketing/common";


export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    readonly subject = Subjects.TicketCreated;

}
import { Publisher, Subjects, TicketUdpatedEvent } from "@psticketing/common";


export class TicketUpdatedPublisher extends Publisher<TicketUdpatedEvent>{
    readonly subject = Subjects.TicketUpdated;

}
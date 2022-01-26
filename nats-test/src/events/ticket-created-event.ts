import { Subjects } from "./subjects";

//Here the ticket created interface will be passed to the generic type of the Events to make sure
//when we use the subject 'ticket:created' we then force the data type should contain {id, title, price}
export interface TicketCreatedEvent {
    subject: Subjects.TicketCreated;
    data: {
        id:string,
        title:string,
        price:number
    }
}
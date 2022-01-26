/* 
    Enum helps to enforce the annotation to be of the types listed inside otherwise the error will jump
    So, here two properties are there and enum will force to make sure the object will use the properties from any 
    one of the listed things
*/
export enum Subjects {
    TicketCreated = 'ticket:created',
    OrderUpdated ='order:updated',
}
import { ExpirationCompleteEvent, Publisher, Subjects } from "@psticketing/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    readonly subject = Subjects.ExpirationComplete;
}
/* 
    This is the mock file provided by the jest , so here how it works
    Step1: Find the file that we want to 'fake'
    Step2: In the same directory, create a folder called '__mocks__'
    Step3: In that folder, create a file with an identical name to the file we want to fake
    Step4: Write a fake implementation
    Step5: Tell jest to use that fake file in our test file
*/
//We are passing the fake client and the use of the client by the TicketCreateEvent class, that implement the base class of Publisher, the publisher has
// client function with publish call function and callbacke was executed there,  For more info in this got to udemy micorservices course > mangin a NATS client> 336 lecture

//Adidng the jest function to make sure that we called the funtion or callback is invoked
export const natsWrapper = {
    client:{
        publish:jest.fn().mockImplementation((subject: string, data: string, callback:()=>void)=>{
            callback();
        })
    }
};
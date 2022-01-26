import nats from 'node-nats-streaming';
import { TicketCreatePublisher } from './events/ticket-created-publisher';

/* 
    Publisher publish the data from the nats server as it requires the channel name to be published on and data, 
    in the nats server the channel is created and the listener should subscibe to the channel and listen to the event
*/

console.clear();

//stan is actually the client term used by the community of the nats (reverse stan)
const stan = nats.connect('ticketing', 'abc', {
    url:'http://localhost:4222',
});

//Here on the nats is event-driven tech so can't use the async/await thing, have to rely on the 
//callback tech

stan.on('connect', async ()=> {
    console.log("Publisher is connected to NATS");
    //Nats received the data as string so need to convert the data into the string file
    const publisher = new TicketCreatePublisher(stan);
    try {
        await publisher.publish({
            id: '23',
            title: 'Ticket created data',
            price: 20
        });
    } catch (error) {
        console.error(error);
    }
    // const data = JSON.stringify({
    //     id:'123',
    //     title:'King Kong',
    //     price:30
    // });

    // stan.publish('ticket:created', data, ()=>{
    //     console.log("Event published on NATS");
    // })
})
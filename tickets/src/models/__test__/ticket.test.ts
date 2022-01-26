import { Ticket } from '../ticket';

it('implements opitimistic concurrency control', async()=>{

    //Create na instance of a ticket
    const ticket = Ticket.build({
        title:'Concert',
        price:20,
        userId:'123'
    });

    //Save the ticket to the database
    await ticket.save();

    //fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    //then we save the first fetched ticket with the version number get at time of fetching
    await firstInstance!.save();

    //If we save the second fetched ticket with the version number get at time of fetching then it
    //will rsult in an error of outdated version number as first fetched is already updated the version number 
    //and we try to update with same version number at fetched time at second save , so it will throw error

    
    try {
        await secondInstance!.save();
    } catch (error) {
        return;
    }

    throw new Error('Should not reached to this point, it should go to catch')
});

it("increments the version number on multiple save", async()=>{
    const ticket = Ticket.build({
        title:'concert',
        price:20,
        userId:'113'
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);
})
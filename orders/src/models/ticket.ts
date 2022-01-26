import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order , OrderStatus} from './order'; 

interface TicketAttrs {
    id:string,
    title: string;
    price: number;
}

export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    version:number;
    isReserved:()=>Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc>{
    build(attrs:TicketAttrs):TicketDoc;
    findByEvent(event:{id:string, version:number}):Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true
    },
    price:{
        type: Number,
        required:true,
        min:0
    }
},{
    toJSON:{
        transform(doc, ret){
            ret.id = ret._id;
            delete ret._id;
        }
    }
});


/* 
    The property of setting version is called the OPTIMISTIC CONCURRENCY CONTROL , search it for more details
*/


//Set the versioKey to version (__v is the version provided in the document)
ticketSchema.set('versionKey','version');

//setting the plugin to use the mongooseUpdateIfCurrent to maintain the version of the doucments
// from the document through plugin used in the update command
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.findByEvent = (event:{id:string, version:number})=>{
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1
    })
}


ticketSchema.statics.build = (attrs:TicketDoc)=>{
    return new Ticket({
        _id:attrs.id, //while saving we renaming the id to _id ,as we are saving the same id from the ticket created to orders ticket created
        title:attrs.title,
        price:attrs.price
    });
}



//Make sure that this ticket is not already reserved
//RUn query to look at all orders. Find an order where the ticket
//is the ticket we just found *and* the orders status is *not* cancelled.
ticketSchema.methods.isReserved = async function(){
    const existingOrder = await Order.findOne({
        ticket:this,
        status:{
            $in:[
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Completed
            ]
        }
    });

    return !!existingOrder;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket',ticketSchema);

export { Ticket};
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

//Creating the interface for the attributes send to the build function of the tickets

interface TicketAttrs {
     title:string;
     price: number;
     userId: string;
}

//Creating the inteface for the Mongoose Documents and also extends the types of Mongoose Documents
//to include the properties exists in the MongooseDocuments

interface TicketDoc extends mongoose.Document {
    title:string;
    price:number;
    userId:string;
    version:number; //this is the version key present in the mongoose field.
    orderId?:string;
}

//Creating the interface for the Mongoose Model to include the property build method with return type
//this is not including in the document of the mongoose.

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs):TicketDoc;
}

//creating the ticket Schema
const ticketSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true
    },
    userId:{
        type:String,
        required:true
    },
    orderId:{
        type: String
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

//static in the class helps to call the method directly without creating the object
ticketSchema.statics.build = (attrs:TicketAttrs)=>{
    return new Ticket(attrs);
}

//Have to research about the generic type from the typescript
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket',ticketSchema);

export { Ticket};
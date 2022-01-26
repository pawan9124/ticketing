import { OrderStatus } from '@psticketing/common';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { TicketDoc } from './ticket';

export { OrderStatus}; //We are using the Order status in the ticket file, so to make the single soure of import we are using the same order

interface OrderAttrs {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
}

//This interface applied to the document of the mongoose of with the extra properties
//passed as generic type to the mongoose.Model
interface OrderDoc extends mongoose.Document {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
    version:number; //this is not in schema  but we present in the document as __v and we are renaming that property to the version
}

//This is to apply the interface OrderModel with generic type
interface OrderModel extends mongoose.Model<OrderDoc>{
    build(attrs:OrderAttrs):OrderDoc;
}

const orderSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    status:{
        type: String,
        required:true,
        enum: Object.values(OrderStatus),
        default:OrderStatus.Created
    },
    expiresAt:{
        type:mongoose.Schema.Types.Date
    },
    ticket:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Ticket'
    }
},{
    toJSON:{
        transform(doc, ret){
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

orderSchema.set("versionKey", 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs:OrderAttrs)=>{
    return new Order(attrs);
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order',orderSchema);

export {Order};
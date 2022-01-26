import { OrderStatus } from '@psticketing/common';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface OrderAttrs {
    id: string;
    version: number;
    userId: string;
    price: number;
    status: OrderStatus;
}

interface OrderDoc extends mongoose.Document {
    //id is not included here cause mongoose.Document contains _id property
    //but we will rename that to id, so id not listed externally
    version: number;
    userId: string;
    price: number;
    status: OrderStatus;
}

interface OrderModel extends mongoose.Model<OrderDoc>{
    build(attrs: OrderAttrs): OrderDoc
}

const orderSchema = new mongoose.Schema({
    //we are not including the version cause the version field is internallly used by the mongoose __v as version by the plugin
    userId:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    status:{
        type:String,
        required:true
    }
},{
    toJSON:{
        transform(doc, ret){ //ret refers to the return data after transformation
            ret.id = ret._id;
            delete ret.id;
        }
    }
});

orderSchema.set('versionKey','version'); // setting the version key in the mongoose to version
orderSchema.plugin(updateIfCurrentPlugin);


//mongoose create model
orderSchema.statics.build = (attrs: OrderAttrs)=>{
   return  new Order({
        _id:attrs.id,
        userId:attrs.userId,
        version:attrs.version,
        status:attrs.status,
        price:attrs.price
    })
}

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order };
import mongoose from 'mongoose';
import { Password } from '../services/password';

//this interface is used to make sure the user we create
//must follow the interface properties while saving the user
//this will prevent us passing invalid property while creating user

interface UserAttrs {
    email:string,
    password:string
}

//An interface that describes the properties
//that get received by the build function used to create the user
//and it will also return the UserDoc we can add properties later
//if the document get changed.
//here extends means extending all the properties of the model and that model also has UserDoc

//Here we are assinging the build method and its return type to the Model not a particular doucment.
interface UserModel extends mongoose.Model<UserDoc>{
    build(attrs:UserAttrs):UserDoc;
}

//An interface that describes the properties
///that a User Document means the at later the mongoose add new properties like createdAt, updatedAt
//so we are creating the structure for typescript to dynamically add the extra properties
interface UserDoc extends mongoose.Document {
    email:string;
    password:string;
}

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
},{
    //This is the second argument passed to the mongoose where we transform the data object
    //here we delete the password when returning the user in client and transform the _id to id
    //where suppose the microservices used in different services.

    toJSON:{
        transform(doc,ret){
            ret.id = doc._id; // assign the _id as id
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }
    }
});

// here we are using the pre-hooks called before the save in database
// We used function here as we gonna use the 'this' keyword and this will 
// point to the hooks being called, if using arrow function then this will 
// point to the context of the object being called.
userSchema.pre('save', async function(done){
    if(this.isModified('password')){
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
});

/* 
    Instead of creating the new User() when creating the user, we are using a stactic field on the class to apply the 
    UserAttribute Typescript validation to the argunments supplied to create the user
*/
userSchema.statics.build = (attrs:UserAttrs)=>{
    return new User(attrs);
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);


export { User };
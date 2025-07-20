import mongoose from "mongoose";
const invoiceSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    invoiceNumber:{type:String,required:true},
    date:{type:Date,default:Date.now},
    dueDate:{type:Date},
    sender:{
        companyName:String,
        address:String,
        email:String,
        phone:String
    },
    client:{
        companyName:String,
        address:String,
        email:String,
        phone:String
    },
    items:[
        {
            description:String,
            quantity:Number,
            price:Number 
        }
    ],
    subtotal:Number,
    tax:Number,
    discount:Number,
    total:Number,
})
export default mongoose.model('Invoice',invoiceSchema);
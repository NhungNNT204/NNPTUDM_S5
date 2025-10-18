let mongoose = require('mongoose');

let schema = new mongoose.Schema({
    name:{
        type:String,
        required: [true,"thang nay khong duoc de trong"],
        unique:true
    },
    price:{
        type:Number,
        default:1
    },
    description:{
        type:String,
        default: "good product"
    },
    category:{
        type:String,
        required: true
    }
    ,
    isDelete:{
        type:Boolean,
        default: false
    }
},{
    timestamps:true
})
schema.methods.delete = function() {
    this.isDelete = true;
    return this.save();
};
module.exports = new mongoose.model('product',schema)
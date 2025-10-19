let mongoose = require('mongoose');

let schema = new mongoose.Schema({
    name:{
        type:String,
        required: [true,"name is required"]
    },
    isDelete:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})
// allow duplicate names for documents that are soft-deleted
// create a partial unique index that only applies when isDelete is false
schema.index({ name: 1 }, { unique: true, partialFilterExpression: { isDelete: false } });
module.exports = new mongoose.model('category',schema)

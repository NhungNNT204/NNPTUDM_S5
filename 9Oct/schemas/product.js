let mongoose = require('mongoose')
let Schema = mongoose.Schema

let ProductSchema = new Schema({
  name: {type:String, required:true},
  price: {type:Number, default:0},
  category: {type: Schema.Types.ObjectId, ref:'Category'},
  isDeleted: {type:Boolean, default:false}
},{timestamps:true})

module.exports = mongoose.model('Product', ProductSchema)
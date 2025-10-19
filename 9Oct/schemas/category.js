let mongoose = require('mongoose')
let Schema = mongoose.Schema

let CategorySchema = new Schema({
  name: {type:String, required:true},
  isDeleted: {type:Boolean, default:false}
},{timestamps:true})

module.exports = mongoose.model('Category', CategorySchema)
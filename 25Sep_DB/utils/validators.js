const mongoose = require('mongoose');

function isValidObjectId(id){
  if(!id) return false;
  return mongoose.Types.ObjectId.isValid(id);
}

function errorResponse(code, message){
  return { success: false, error: { code, message } };
}

module.exports = { isValidObjectId, errorResponse };

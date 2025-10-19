let mongoose = require('mongoose');

let schema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'text is required']
  },
  postId: {
    type: String
  },
  isDelete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = new mongoose.model('comment', schema);

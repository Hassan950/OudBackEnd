const mongoose = require('mongoose');

const queueSchema = mongoose.Schema({
  tracks: [{
    type: mongoose.Types.ObjectId,
    ref: 'Track'
  }],
  context: {
    type: {
      type: String,
      enum: ['album', 'artist', 'playlist', 'unknown'],
      default: 'unknown'
    },
    id: {
      type: mongoose.Types.ObjectId
    }
  }
}, {
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});

const Queue = mongoose.model('Queue', queueSchema);

module.exports = {
  queueSchema,
  Queue
}
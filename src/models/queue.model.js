const mongoose = require('mongoose');

const queueSchema = mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'Player must belong to a user'],
    select: false,
    unique: true
  },
  tracks: [mongoose.Types.ObjectId],
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

const Queue = mongoose.model('queue', queueSchema);

module.exports = {
  queueSchema,
  Queue
}
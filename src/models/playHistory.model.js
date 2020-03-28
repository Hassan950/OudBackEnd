const mongoose = require('mongoose');
const moment = require('moment');

const playHistorySchema = mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
    select: false,
  },
  track: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Track'
  },
  context: {
    type: {
      type: String,
      enum: ['album', 'artist', 'playlist', 'unknown'],
      default: 'unknown'
    },
    id: {
      type: mongoose.Types.ObjectId
    }
  },
  playedAt: {
    type: Number,
    default: moment().unix()
  }
}, {
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});

playHistorySchema.index({ playedAt: 1, user: 1 });

const PlayHistory = mongoose.model('PlayHistory', playHistorySchema);

module.exports = {
  playHistorySchema,
  PlayHistory
}
const mongoose = require('mongoose');

const playHistorySchema = mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
    select: false,
  },
  context: {
    type: {
      type: String,
      enum: ['Album', 'Artist', 'Playlist']
    },
    item: {
      type: mongoose.Types.ObjectId,
      refPath: 'context.type'
    }
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});

playHistorySchema.index({ user: 1, playedAt: 1 });

const PlayHistory = mongoose.model('PlayHistory', playHistorySchema);

module.exports = {
  playHistorySchema,
  PlayHistory
}
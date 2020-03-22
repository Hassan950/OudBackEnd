const mongoose = require('mongoose');

const playerSchema = mongoose.Schema({
  device: {
    type: mongoose.Types.ObjectId,
    ref: 'Device'
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'Player must belong to a user'],
    select: false
  },
  progressMs: {
    type: Number,
    default: null
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  shuffleState: {
    type: Boolean,
    default: false
  },
  repeatState: {
    type: String,
    enum: ['off', 'track', 'context'],
    default: 'off'
  },
  currentlyPlayingType: {
    type: String,
    enum: ['track', 'ad', 'unknown'],
    default: 'unknown'
  },
  item: {
    type: mongoose.Types.ObjectId,
    ref: 'Track'
  },
  context: {
    type: {
      type: {
        type: String,
        enum: ['album', 'artist', 'playlist', 'unknown'],
        default: 'unknown'
      },
      id: {
        type: mongoose.Types.ObjectId
      }
    }
  }
}, {
  _id: false,
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});

playerSchema.index({ userId: 1 });

const Player = mongoose.model('Player', playerSchema);

module.exports = {
  playerSchema,
  Player
}
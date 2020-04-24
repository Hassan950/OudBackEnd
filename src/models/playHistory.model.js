const mongoose = require('mongoose');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

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
      required: true,
      enum: ['Album', 'Artist', 'Playlist']
    },
    item: {
      type: mongoose.Types.ObjectId,
      required: true,
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

playHistorySchema.index({ user: 1, playedAt: -1 });
playHistorySchema.index({ user: 1, "context.type": 1, "context.item": 1 }, { unique: 1 });

playHistorySchema.virtual('context.id').get(function () {
  if (this.context.item && this.context.item._id)
    return this.context.item._id;
  else
    return this.context.item;
});

playHistorySchema.plugin(mongooseLeanVirtuals);

const PlayHistory = mongoose.model('PlayHistory', playHistorySchema);

module.exports = {
  playHistorySchema,
  PlayHistory
}
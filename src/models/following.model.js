const mongoose = require('mongoose');

const followingsSchema = mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followedId: {
    type: mongoose.Types.ObjectId,
    refPath: 'type',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Artist', 'User']
  }
});

followingsSchema.index({ type: 1, userId: 1 });

const Followings = mongoose.model('Followings', followingsSchema);

module.exports = {
  followingsSchema,
  Followings
};

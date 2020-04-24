const mongoose = require('mongoose');

const recentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{ type: mongoose.Schema.Types.ObjectId}],
  types: 
  [
    {
      type: String, 
      enum: ['playlist', 'track','album','Artist','User']
    }
  ]
  });

const Recent = mongoose.model('Recent', recentSchema);
module.exports = { Recent, recentSchema };
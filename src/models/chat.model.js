const mongoose = require('mongoose');
const chatSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      ref: 'Playlist',
      trim: true,
      required: true
    }
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

chatSchema.virtual('type').get(
  function() {
    return 'message';
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);


const Chat = mongoose.model('Chat', chatSchema);
module.exports = { Chat, chatSchema };

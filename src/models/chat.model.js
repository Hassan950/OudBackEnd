const mongoose = require('mongoose');
const mongooseLeanDefaults = require('mongoose-lean-defaults')

const messageSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
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
    },
    timestamps: { createdAt: 'sentAt' }
  }
);

const threadSchema = new mongoose.Schema(
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
    read: {
      type: Boolean,
      default: false,
    },
    messages: [messageSchema]
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    },
    timestamps: { updatedAt: 'updatedAt' }
  }
);

/* istanbul ignore next */
threadSchema.virtual('type').get(
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

threadSchema.index({ from: 1, to: 1 }, { unique: true });
threadSchema.plugin(mongooseLeanDefaults);
const Message = mongoose.model('Message', messageSchema);
const Thread = mongoose.model('Thread', threadSchema);

module.exports = { Thread, threadSchema, Message, messageSchema };

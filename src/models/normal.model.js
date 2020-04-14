const mongoose = require('mongoose');
const { User } = require('./user.model');

const normalSchema = mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free'
    },
    credit: {
      type: Number,
      default: 0
    },
    plan: {
      type: Date,
      default: null
    }
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    },
    discriminatorKey: 'type'
  }
);

const Normal = User.discriminator('Normal', normalSchema);

module.exports = { Normal, normalSchema };

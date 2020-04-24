const mongoose = require('mongoose');
const validator = require('validator');

const adSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 1,
      maxlength: 30,
      required: true,
      trim: true
    },
    link: {
      type: String,
      validate: validator.isURL
    },
    audioUrl: {
      type: String,
      required: true,
      match: /\.mp3$/
    },
    duration: {
      type: Number,
      required: true,
      min: 0
    },
    image: { type: String, match: /\.(png|jpg|jpeg)$/, default: 'default.jpg' }
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

adSchema.virtual('type').get(function () {
  return 'ad';
});

const Ad = mongoose.model('Ad', adSchema);

module.exports = { Ad, adSchema };
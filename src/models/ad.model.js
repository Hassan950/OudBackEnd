const mongoose = require('mongoose');

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
      // https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
      match: /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi
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
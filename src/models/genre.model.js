const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 20,
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

genreSchema.virtual('type').get(function() {
  return 'genre';
});

const Genre = mongoose.model('Genre', genreSchema);

module.exports = { Genre, genreSchema };

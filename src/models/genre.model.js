const mongoose = require('mongoose');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

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

genreSchema.plugin(mongooseLeanVirtuals);

const Genre = mongoose.model('Genre', genreSchema);

module.exports = { Genre, genreSchema };

const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      select: false
    },
    genres: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: 'An artist should have at least one genre'
      }
    },
    name: {
      type: String,
      minlength: 3,
      maxlength: 30,
      required: true,
      trim: true,
      unique: true
    },
    bio: {
      type: String,
      maxlength: 255,
      default: ''
    },
    popularSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }]
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

artistSchema.virtual('type').get(function() {
  return 'artist';
});

const Artist = mongoose.model('Artist', artistSchema);

module.exports = { Artist, artistSchema };

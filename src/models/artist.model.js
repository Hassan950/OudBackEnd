const mongoose = require('mongoose');
const { User } = require('./user.model');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

const artistSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['artist'],
      default: 'artist'
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
    },
    discriminatorKey: 'type'
  }
);

artistSchema.plugin(mongooseLeanVirtuals);

const Artist = User.discriminator('Artist', artistSchema);

module.exports = { Artist, artistSchema };

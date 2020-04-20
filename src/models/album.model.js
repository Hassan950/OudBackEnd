const mongoose = require('mongoose');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

const albumSchema = new mongoose.Schema(
  {
    album_type: {
      type: String,
      enum: ['single', 'album', 'compilation']
    },
    album_group: {
      type: String,
      enum: ['single', 'album', 'compilation', 'appears_on']
    },
    artists: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }],
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: 'An album must have at least one artist'
      }
    },
    tracks: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }]
    },
    genres: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: 'An album should have at least one genre'
      }
    },
    image: { type: String, match: /\.(png|jpg|jpeg|svg)$/ },
    name: {
      type: String,
      minlength: 1,
      maxlength: 30,
      required: true,
      trim: true
    },
    released: {
      type: Boolean,
      default: false
    },
    release_date: {
      type: String,
      match: /^([0-2][0-9]|(3)[0-1])(-)(((0)[0-9])|((1)[0-2]))(-)((1)[5-9]\d{2}|(2)(0)[0-1][0-9]|2020)$/,
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

albumSchema.pre('save', async function(next) {
  this.album_group = this.album_type;
  next();
});

albumSchema.virtual('type').get(function() {
  return 'album';
});

albumSchema.plugin(mongooseLeanVirtuals);

const Album = mongoose.model('Album', albumSchema);

module.exports = { Album, albumSchema };

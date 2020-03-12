const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  followersCount: { type: Number, default: 0 }, 
  genres: {
    type: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Genre' } ],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'An album should have at least one genre'
    }
  },
  images: [{ type: String, match: /.(png|jpg|jpeg)$/ }],
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
});

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;

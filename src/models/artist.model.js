const mongoose = require('mongoose');


const artistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  followersCount: { type: Number, default: 0},
  genres: {
    type: [ {
      type: String,
      minlength: 2,
      maxlength: 30
    } ]
},
  images: [ { type: String,
    match: /.(png|jpg|jpeg)/
   } ],
  name: {
    type: String,
    minlength: 3,
    maxlength: 30,
    required: true
  },
  bio: {
    type: String,
    maxlength: 100,
  },
  popularSongs: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Track'} ]
});

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist
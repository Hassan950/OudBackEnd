const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  album_type: {
    type: String,
    enum: ['single', 'album', 'compilation']
  },
  album_group:{
    type: String,
    enum: ['single', 'album', 'compilation']
  },
  artists:{
    type: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' } ],
    required: [true, 'An album must have at least one artist']
  },
  genres: {
    type: [ {
      type: String,
      minlength: 2,
      maxlength: 30
    } ]
  },
  image: { type: String,
    match: /.(png|jpg|jpeg)/
  },
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true
  },
  released: Boolean,
  release_date: { type: Date }

});


const Album = mongoose.model('Album', albumSchema);

module.exports = Album;
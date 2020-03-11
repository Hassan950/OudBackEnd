const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 1,
    maxlength: 30,
    required: true
  },
  artists: {
    type: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' } ],
    required: [true, 'A track must have at least one artist']
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
    required: true
  },
  audiUrl: { 
    type: String,
    required: true,
    match: /\.mp3/
    }
});
// file:///C:/Users/Mohamad%20Abo%20Bakr/Downloads/ER.pdf

const Track = mongoose.model('Track', trackSchema);

module.exports = Track;
const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 20,
    required: true
  }
});

const Genre = mongoose.model('Genre', genreSchema);

module.exports = { Genre, genreSchema };

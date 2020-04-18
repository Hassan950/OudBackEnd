const mongoose = require('mongoose');
const validator = require('validator');

const requestSchema = new mongoose.Schema({
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
  displayName: {
    type: String,
    required: [true, 'Please Enter your displayName!'],
    trim: true,
    maxlength: 30
  },
  name: {
    type: String,
    required: [true, 'Please Enter your username!'],
    unique: [true, 'This username is used!'],
    minlength: [5, 'Username is very short!'],
    maxlength: [30, 'Username is very long!'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please Enter your email!'],
    unique: [true, 'This email is used!'],
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email!'],
    trim: true
  }
});

const Request = mongoose.model('Request', requestSchema);

module.exports = { Request, requestSchema };

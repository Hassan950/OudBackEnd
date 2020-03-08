const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = mongoose.Schema({
  displayName: {
    type: String,
    required: [true, 'Please Enter your displayName!'],
    trim: true
  },
  username: {
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
  },
  images: [String],
  password: {
    type: String,
    required: [true, 'Please enter your password!'],
    minlength: [8, 'Password is very short!'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    minlength: [8, 'Password Confirm is very short!'],
    select: false,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same'
    }
  },
  role: {
    type: String,
    enum: ['free', 'premium', 'artist'],
    required: [true, 'Please Enter the user role!']
  },
  birthDate: {
    type: Date,
    get: bd => format('yyyy-MM-dd')
  },
  verified: {
    type: Boolean,
    default: false
  },
  gender: {
    type: String,
    enum: ['M', 'F'],
    uppercase: true
  },
  country: {
    type: String, 
    validate: [ validator.isISO31661Alpha2, 'Invalid country'],
    trim: true,
    uppercase: true,
    required: [true, 'Please Enter your Country!']
  },
  facebook_id: {
    type: String
  },
  google_id: {
    type: String
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
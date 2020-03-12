const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const moment = require('moment');

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
    minlength: [8, 'Please confirm your password!'],
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
    default: 'free'
  },
  birthDate: {
    type: Date,
    validate: {
      validator: function (bd) {
        return moment().diff(bd, 'years') > 10;
      },
      message: 'You must be at least 10 years old'
    }
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
    validate: [validator.isISO31661Alpha2, 'Invalid country'],
    trim: true,
    uppercase: true,
    required: [true, 'Please Enter your Country!']
  },
  facebook_id: {
    type: String,
    select: false
  },
  google_id: {
    type: String,
    select: false
  },
  passwordChangedAt: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
}, {
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});

userSchema.virtual('type').get(function () {
  return 'user';
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 8);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now();
  next();
});

userSchema.post('save', (docs, next) => {
  docs.password = undefined;
  docs.passwordConfirm = undefined;
  docs.__v = undefined;
  next();
});

userSchema.post(/^find/, function (docs, next) {
  if (docs) {
    docs.__v = undefined;
  }

  next();
})

const User = mongoose.model('User', userSchema);

module.exports = { User, userSchema };

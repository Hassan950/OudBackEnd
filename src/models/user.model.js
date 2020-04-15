const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const moment = require('moment');

const setImages = imgs => {
  if (imgs.length == 0) {
    imgs.push('uploads\\users\\default-Profile.jpg');
  }
  if (imgs.length == 1) {
    imgs.push('uploads\\users\\default-Cover.jpg');
  }
  return imgs;
};

const userSchema = mongoose.Schema(
  {
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
    birthDate: {
      type: Date,
      validate: {
        validator: function (bd) {
          return moment().diff(bd, 'years') > 10;
        },
        message: 'You must be at least 10 years old'
      }
    },
    images: {
      type: [
        {
          type: String,
          match: /((^(uploads\\users\\)(default-){1,1}[a-zA-Z]+\.(jpg|png|jpeg)$)|(^.*-([a-f\d]{24})-[0-9]*\.(jpg|jpeg|png)))/
        }
      ],
      default: [
        'uploads\\users\\default-Profile.jpg',
        'uploads\\users\\default-Cover.jpg'
      ],
      validate: {
        validator: function (imgs) {
          return imgs && imgs.length > 0;
        }
      },
      set: setImages
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
    verifyToken: {
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
    queues: {
      type: [{
        type: mongoose.Types.ObjectId,
        ref: 'Queue'
      }],
      select: false
    }
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


userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 8);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now();
  next();
});


userSchema.methods.changedPasswordAfter = function (user, JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = { User, userSchema };

const mongoose = require('mongoose');

const deviceSchema = mongoose.Schema({
  id: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isPrivateSession: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["Computer", "Tablet", "Smartphone", "Speaker", "TV", "AVR", "STB", "AudioDongle", "GameConsole", "CastVideo", "CastAudio", "Automobile", "Unknown"],
    default: 'Unkown'
  },
  volumePercent: {
    type: Number,
    minimum: 0,
    maximum: 100
  },
  userId: {
    type: String,
    ref: 'User',
    required: [true, 'Device must belong to a user'],
    select: false
  }
}, {
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});

deviceSchema.index({ userId: 1 });


const Device = mongoose.model('Device', deviceSchema);

module.exports = {
  deviceSchema,
  Device
}
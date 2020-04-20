const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({
  value: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  used: {
    type: Boolean,
    default: undefined
  }
});


const Coupon = mongoose.model('Coupon', couponSchema);


module.exports = {
  couponSchema,
  Coupon
};

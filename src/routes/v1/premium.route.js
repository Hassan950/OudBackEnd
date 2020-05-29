const express = require('express');
const { premiumController } = require('../../controllers');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { premiumValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');

const router = express.Router();

// all routes need authentication
router.use(catchAsync(authMiddleware.authorize('free', 'premium')));

router
  .route('/redeem')
  .patch(
    validate(premiumValidation.redeem),
    catchAsync(premiumController.redeem)
  );

router.route('/subscribe').patch(catchAsync(premiumController.subscribe));

router.route('/gift').patch(validate(premiumValidation.gift), catchAsync(premiumController.gift));

module.exports = router;

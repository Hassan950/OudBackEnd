const express = require('express');
const { libraryController } = require('../../controllers');
const authMiddleware = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { libraryValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync');

const router = express.Router({ mergeParams: true });
router.use(catchAsync(authMiddleware.authenticate));

router
  .route('/')
  .get(validate(libraryValidation.get), catchAsync(libraryController.get))
  .put(validate(libraryValidation.put), catchAsync(libraryController.put))
  .delete(validate(libraryValidation.delete), catchAsync(libraryController.delete));

router
  .route('/contains')
  .get(validate(libraryValidation.check), catchAsync(libraryController.check));

module.exports = router;

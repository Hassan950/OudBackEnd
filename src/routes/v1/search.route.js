const express = require('express');
const { searchController } = require('../../controllers');
const { searchValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync.js');
const validate = require('../../middlewares/validate');

const router = express.Router({ mergeParams: true });
router
  .route('/')
  .get(
    validate(searchValidation.search),
    catchAsync(searchController.search)
  );
  router
  .route('/recent')
  .put(
    validate(searchValidation.addToRecent),
    catchAsync(searchController.addTORecent)
  )
  .get(
    validate(searchValidation.getRecent),
    catchAsync(searchController.getRecent)
  );
module.exports = router;

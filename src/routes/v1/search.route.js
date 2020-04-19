const express = require('express');
const { searchController } = require('../../controllers');
const { searchValidation } = require('../../validations');
const catchAsync = require('../../utils/catchAsync.js');
const validate = require('../../middlewares/validate');

const router = express.Router();

router
  .route('/')
  .get(
    validate(searchValidation.search),
    catchAsync(searchController.search)
  );
module.exports = router;

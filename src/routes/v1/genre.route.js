const express = require('express');
const { genreController } = require('../../controllers');
const catchAsync = require('../../utils/catchAsync');
const validate = require('../../middlewares/validate');
const { genreValidation } = require('../../validations');

const router = express.Router();

router
  .route('/:id')
  .get(
    validate(genreValidation.oneGenre),
    catchAsync(genreController.getGenre)
  );

router
  .route('/')
  .get(
    validate(genreValidation.several),
    catchAsync(genreController.getGenres)
  );

module.exports = router;

const express = require('express');

const router = express.Router();

router
  .route('/signup')
  .get((req, res) => {
    res.status(200).send({
      user: 'loool'
    })
  });

module.exports = router;
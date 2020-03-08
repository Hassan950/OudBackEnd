const express = require('express');
const homeRoute = require('./home.route.js');
const userRoute = require('./user.route.js');

const router = express.Router();

router.use('/', homeRoute);
router.use('/users', userRoute);

module.exports = router;

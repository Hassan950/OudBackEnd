const express = require('express');
const homeRoute = require('./home.route.js');
const userRoute = require('./user.route.js');
const userMeRoute = require('./userMe.route.js');

const router = express.Router();

router.use('/', homeRoute);
router.use('/users', userRoute);
router.use('/me', userMeRoute)

module.exports = router;

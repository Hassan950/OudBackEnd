const express = require('express');
const homeRoute = require('./home.route');
const userRoute = require('./user.route');
const userMeRoute = require('./userMe.route');
const trackRoute = require('./tracks.route');

const router = express.Router();

router.use('/', homeRoute);
router.use('/users', userRoute);
router.use('/me', userMeRoute)
router.use('/tracks', trackRoute)

module.exports = router;

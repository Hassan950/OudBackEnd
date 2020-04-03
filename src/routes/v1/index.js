const express = require('express');
const homeRoute = require('./home.route');
const userRoute = require('./user.route');
const userMeRoute = require('./userMe.route');
const browseRoute = require('./browse.route');
const trackRoute = require('./tracks.route');
const authRoute = require('./auth.route');
const followRouter = require('./follow.route');

const router = express.Router();

router.use('/', homeRoute);
router.use('/me', userMeRoute);
router.use('/users', userRoute);
router.use('/browse', browseRoute);
router.use('/tracks', trackRoute);
router.use('/auth', authRoute);
router.use('/', followRouter);

module.exports = router;

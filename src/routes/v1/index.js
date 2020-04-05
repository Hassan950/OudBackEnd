const express = require('express');
const homeRoute = require('./home.route');
const userRoute = require('./user.route');
const userMeRoute = require('./userMe.route');
const browseRoute = require('./browse.route');
const trackRoute = require('./tracks.route');
const authRoute = require('./auth.route');
const albumRoute = require('./album.route');
const artistRoute = require('./artist.route');
const genreRoute = require('./genre.route');

const router = express.Router();

router.use('/', homeRoute);
router.use('/users', userRoute);;
router.use('/browse',browseRoute);
router.use('/me', userMeRoute)
router.use('/tracks', trackRoute)
router.use('/auth', authRoute);
router.use('/albums', albumRoute);
router.use('/artists', artistRoute);
router.use('/genres', genreRoute);

module.exports = router;

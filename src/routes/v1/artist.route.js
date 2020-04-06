const express = require('express');
const albumRoute = require('./album.route')

const router = express.Router();

router.use('/albums', albumRoute)



module.exports = router
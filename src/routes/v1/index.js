const express = require('express');
const homeRoute = require('./home.route.js');

const router = express.Router();

router.use('/', homeRoute);

module.exports = router;

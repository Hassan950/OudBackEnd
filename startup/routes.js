const express = require('express');
const hello = require('../routes/hello');

module.exports = function(app) {
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/hello', hello);
};

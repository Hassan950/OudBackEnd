const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

/* istanbul ignore next */
const getAll = catchAsync(async (req, res) => {
	res.send('Hello, Web');
});

module.exports = {
	getAll
}
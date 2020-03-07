const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
	res.send('HELLOOOOOOOOO!!!!!!!!!!!!');
});

module.exports = {
	getAll
}
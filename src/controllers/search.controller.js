const { searchService } = require('../services');
const AppError = require('../utils/AppError');


exports.search = async(req, res, next) => {
  const items = await searchService.search(req.query);
  res.status(200).json(items);
};

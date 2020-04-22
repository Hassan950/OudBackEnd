const { searchService } = require('../services');
const AppError = require('../utils/AppError');


exports.search = async(req, res, next) => {
  if (req.baseUrl.match(/.*me.*/)) {
    return next(new AppError('endpoint not found', 404));
  }
  const items = await searchService.search(req.query);
  res.status(200).json(items);
};

exports.addTORecent = async(req,res,next)=>{
  if (req.baseUrl == "/api/v1/search") {
    return next(new AppError('endpoint not found', 404));
  }
  await searchService.addToRecent(req.user,req.body);
  res.sendStatus(200);
}

exports.getRecent = async(req,res,next)=>{
  if (req.baseUrl == "/api/v1/search") {
    return next(new AppError('endpoint not found', 404));
  }
  const items = await searchService.getRecent(req.user,req.query);
  res.status(200).json(items);
}
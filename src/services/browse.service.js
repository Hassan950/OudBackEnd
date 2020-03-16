const { Category ,Album, Playlist } = require('../models');
const AppError = require('../utils/AppError');
const limits = require('../utils/service.util');

module.exports.findCategories = async function findCategories(query){
  const newQuery = limits.getLimits(query);
  const categories = await Category.find().skip(newQuery.offset).limit(newQuery.limit);
  const offset = newQuery.offset;
  const limit = newQuery.limit;
  const total = await Category.countDocuments();
  return {categories , offset ,limit ,total };
} 
module.exports.findCategory = async function findCategories(params){
  const category = await Category.findById(params.id);
  return category;
}
module.exports.getPlaylists = async function 
getPlaylists(category , query) {
  const newQuery = limits.getLimits(query);
  console.log(category.id);
  const playlists = await Category.findById(category.id).populate('playlists').skip(newQuery.offset).limit(newQuery.limit);
  if(!playlists)throw (new AppError('The category with the given ID was not found.', 404));
  const offset = newQuery.offset;
  const limit = newQuery.limit;
  const total = await Category.findById(category.id).select('playlist').countDocuments();
  return {playlists , offset ,limit ,total };
} 
module.exports.getNewReleases = async function getNewReleases(query)
{
  const newQuery = limits.getLimits(query);
  const albums = await Album.find().skip(newQuery.offset).limit(newQuery.limit).sort({release_date: -1}); 
  const offset = newQuery.offset;
  const limit = newQuery.limit;
  const total = await Album.countDocuments();
  return {albums , offset ,limit ,total };
} 

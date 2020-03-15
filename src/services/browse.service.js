const { Category ,Album, Playlist } = require('../models');
const limits = require('../utils/service.util');

module.exports.findCategories = async function findCategories(query){
  const newQuery = limits.getLimits(query);
  const categories = await Category.find().skip(newQuery.start).limit(newQuery.end);
  const offset = newQuery.start;
  const limit = categories.length;
  const total = newQuery.end;
  return {categories , offset ,limit ,total };
} 
module.exports.findCategory = async function findCategories(params){
  const category = await Category.findById(params.id);
  return category;
}
module.exports.getPlaylists = async function getPlaylists(category , query)
{
  const newQuery = limits.getLimits(query);
  const playlists = await Playlist.find( { _id: {$in: category.playlists} } ).skip(newQuery.start).limit(newQuery.end);
  const offset = newQuery.start;
  const limit = playlists.length;
  const total = newQuery.end;
  return {playlists , offset ,limit ,total };
} 
module.exports.getNewReleases = async function getNewReleases(query)
{
  const newQuery = limits.getLimits(query);
  const albums = await Album.find().skip(newQuery.start).limit(newQuery.end).sort({release_date: -1}); 
  const offset = newQuery.start;
  const limit = albums.length;
  const total = newQuery.end;
  return {albums , offset ,limit ,total };
} 

const { Category ,Album, Playlist } = require('../models');

module.exports.findCategories = async function findCategories(query){
  const categories = await Category.find().skip(query.offset).limit(query.limit);
  const total = await Category.countDocuments();
  return {categories , total };
} 
module.exports.findCategory = async function findCategories(params){
  const category = await Category.findById(params.id);
  return category;
}
module.exports.getPlaylists = async function 
getPlaylists(category , query) {
  const playlists = await Category.findById(category.id).populate('playlists').skip(query.offset).limit(query.limit);
  if(!playlists){const total = 0 ;
    return{ playlists , total };
  } 
  const total = await Category.findById(category.id).select('playlist').countDocuments();
  return {playlists  ,total };
} 
module.exports.getNewReleases = async function getNewReleases(query)
{
  const albums = await Album.find().skip(query.offset).limit(query.limit).sort({release_date: -1}); 
  const total = await Album.countDocuments();
  return {albums  ,total };
} 

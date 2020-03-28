const { Category ,Album,  Playlist  } = require('../models');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

module.exports.findCategories = async function findCategories(query){
  const categories = await Category.find().select('-playlists').skip(query.offset).limit(query.limit);
  const total = await Category.countDocuments();
  return {categories , total };
} 
module.exports.findCategory = async function findCategories(params){
  const category = await Category.findById(params.id).select('-playlists');
  return category;
}
module.exports.getPlaylists = async function 
getPlaylists(params , query) {
  const category = await Category.findById(params.id);
  if(!category){ const total = 0 ;
    return{ category , total };
  }
  const playlists = await Playlist.find( { _id: {  $in: category.playlists  } }).skip(query.offset).limit(query.limit);
  const total = category.playlists.length;
  return {  playlists  ,total };
} 
module.exports.getNewReleases = async function getNewReleases(query)
{
  const albums = await Album.find().skip(query.offset).limit(query.limit).sort({release_date: -1}); 
  const total = await Album.countDocuments();
  return {  albums  ,total };
} 

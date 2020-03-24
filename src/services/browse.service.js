const { Category ,Album,  Playlist  } = require('../models');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

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
getPlaylists(params , query) {
  const id = params.id;
  const offset = query.offset;
  const limit = query.limit;
  const category = await Category.findById(params.id);
  if(!category){ const total = 0 ;
    return{ category , total };
  }
  const ids = category.playlists;
  const playlists = await Playlist.find( { _id: {  $in: ids  } }).skip(offset).limit(limit);
  const no = await Category.aggregate().match({ _id: ObjectId(id) }).project({  numberOfPlaylists: {  $size: "$playlists" } });
  const total = no[0].numberOfPlaylists;
  return {  playlists, offset, limit  ,total };
} 
module.exports.getNewReleases = async function getNewReleases(query)
{
  const offset = query.offset;
  const limit = query.limit;
  const albums = await Album.find().skip(query.offset).limit(query.limit).sort({release_date: -1}); 
  const total = await Album.countDocuments();
  return {  albums, offset, limit  ,total };
} 

const { Category ,Album } = require('../models');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

module.exports.findCategories = async function findCategories(query){
  const categories = await Category.find().skip(query.offset).limit(query.limit);
  const total = await Category.countDocuments();
  return {  categories , total  };
} 
module.exports.findCategory = async function findCategories(params){
  const category = await Category.findById(params.id);
  return category;
}
module.exports.getPlaylists = async function 
getPlaylists(params , query) {
  const id = params.id;
  const playlists = await Category.findById(params.id).select({playlists : {$slice: [query.offset,query.limit]}}).populate('playlists');
  if(!playlists){ const total = 0 ;
    return{ playlists , total };
  }
  const no = await Category.aggregate([
    {
      $match: { _id: ObjectId(id) }
    },
    {
      $project: {
        numberOfPlaylists: {  $size: "$playlists" }
      }
    }
  ]);
  console.log(await Category);
  const total = no[0].numberOfPlaylists;
  return {  playlists  ,total };
} 
module.exports.getNewReleases = async function getNewReleases(query)
{
  const albums = await Album.find().skip(query.offset).limit(query.limit).sort({release_date: -1}); 
  const total = await Album.countDocuments();
  return {  albums  ,total };
} 

const { Category } = require('../models');
const { Album } = require('../models');
const limits = require('../utils/limits.js');

module.exports.findCategories = async function findCategories(query){
  const categories = await Category.find();
  const newQuery = limits.getLimits(query);
  return categories.slice(newQuery.start , newQuery.end);
} 
module.exports.findCategory = async function findCategories(params){
  const category = await Category.findById(params.id);
  return category;
}
module.exports.getPlaylists = async function getPlaylists(category , query)
{
  const newQuery = limits.getLimits(query);
  return category.playlists.slice(newQuery.start , newQuery.end);
} 
module.exports.getNewReleases = async function getNewReleases(query)
{
  const albums = await Album.find({ released: true, release_date: /.*2020.*/ }); 
  const newQuery = limits.getLimits(query);
  return albums.slice(newQuery.start , newQuery.end);
} 

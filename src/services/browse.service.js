const { Category, Album, Playlist } = require('../models');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


/**
 * A method that gets array of categories
 *
 * @function
 * @author Ahmed Magdy
 * @summary Get list categories
 * @param {Object} query An object containing the URL query parameters
 * @returns {Object} An object that contains array of categories and total no of categories found
 */

module.exports.findCategories = async function findCategories(query) {
  const categories = await Category.find()
    .select('-playlists')
    .skip(query.offset)
    .limit(query.limit);
  const total = await Category.countDocuments();
  return { categories, total };
};

/**
 * A method that gets a category by it's ID
 *
 * @function
 * @author Ahmed Magdy
 * @summary gets a Category
 * @property {object} parmas An object containing parameter values parsed from the URL path
 * @returns null if the category was not found
 * @returns category if the category was found
 */

module.exports.findCategory = async function findCategories(params) {
  const category = await Category.findById(params.id).select('-playlists');
  return category;
};

/**
* A method that gets array of playlists of a category
 *
 * @function
 * @author Ahmed Magdy
 * @summary Get list of playlists of a category
 * @property {object} parmas An object containing parameter values parsed from the URL path
 * @param {Object} query An object containing the URL query parameters
 * @returns {Object} An object that contains array of playlists in a category and total no of playlists found
 * @returns null if the category was not found and total of zero
 */

module.exports.getPlaylists = async function getPlaylists(params, query) {
  const category = await Category.findById(params.id);
  if (!category) {
    const total = 0;
    return { category, total };
  }
  const playlists = await Playlist.find({ _id: { $in: category.playlists } })
    .populate({
    path:'tracks',
    populate: {
      path: 'album artists',
      select: '-tracks -genres -released -release_date',
      select: 'type displayName images name',
      populate: {
        path:'artists',
        select:'type displayName images'
      }
    }
  })
    .skip(query.offset)
    .limit(query.limit);
  const total = category.playlists.length;
  return { playlists, total };
};

/**
 * A method that gets array of newReleased Albums
 *
 * @function
 * @author Ahmed Magdy
 * @summary Get list newReleased Albums
 * @param {Object} query An object containing the URL query parameters
 * @returns {Object} An object that contains array of albums and total no of categories found
 */

module.exports.getNewReleases = async function getNewReleases(query) {
  const albums = await Album.find()
    .skip(query.offset)
    .limit(query.limit)
    .select('-tracks -genres -released -release_date')
    .populate({
     path:'artists',
     select: 'displayName type images _id',
    })
    .sort({ release_date: -1 });
  const total = await Album.countDocuments();
  return { albums, total };
};

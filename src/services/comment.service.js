const { PlaylistComments , AlbumComments, User, Album, Playlist } = require('../models');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


/**
 * A method that gets array of comments of the passed album
 *
 * @function
 * @author Ahmed Magdy
 * @summary Gets comment made on this album by users
 * @property {object} params An object containing parameter values parsed from the URL path (it contains id of album which comment is added to)
 * @param {object} query An object containing the URL query parameters it has offset which is the beginning index to return and has limit which is number of items to return
 * @returns {object} comments which are comments on album and total which is number of all comments on this album
 */

module.exports.getAlbumComment = async function getAlbumComment(params,query) {
  const comments = await AlbumComments.find({ albumId: params.id })//this finds AlbumComments object which has albumId equals to the id passed in the params
    .select('-_id -__v -albumId')// to unselect _id , __V , albumId
    .skip(query.offset)// to skip offset
    .limit(query.limit);// to return limit number of comments
  const total = await AlbumComments.countDocuments({ albumId: params.id });//to get total number of comments with albumId equals ti Id passed in params
  return { comments, total };
};

/**
 * A method that gets array of comments of the passed playlist
 *
 * @function
 * @author Ahmed Magdy
 * @summary Gets comment made on this playlist by users
 * @property {object} params An object containing parameter values parsed from the URL path (it contains id of playlist which comment is added to)
 * @param {object} query An object containing the URL query parameters it has offset which is the beginning index to return and has limit which is number of items to return
 * @returns {object} comments which are comments on playlist and total which is number of all comments on this playlist
 */

module.exports.getPlaylistComment = async function getPlaylistComment(params,query) {
  const comments = await PlaylistComments.find({ playlistId: params.id })//this finds PlaylistComments object which has playlistId equals to the id passed in the params
    .select('-_id -__v -playlistId')// to unselect _id , __V , playlistId
    .skip(query.offset)// to skip offset
    .limit(query.limit);// to return limit number of comments
  const total = await PlaylistComments.countDocuments({ playlistId: params.id });//to get total number of comments with playlistId equals ti Id passed in params
  return { comments, total };
};

/**
 * A method that creates a comment to passed album by the logged in user
 *
 * @function
 * @author Ahmed Magdy
 * @summary make a comment on an album
 * @property {object} params An object containing parameter values parsed from the URL path (it contains id of album which comment is added to)
 * @param {string} Name name of user looged in
 * @param {object} body An object that holds parameters that are sent up from the client in the request(it contains comment written by user)
 */

module.exports.makeAlbumComment = async function makeAlbumComment(params, Name, body) {
  await AlbumComments.create({//this create new AlbumComment object with Name and id and comment passed 
    userName: Name,
    albumId: params.id,
    comment: body.comment
  });
};

/**
 * A method that gets displayName of logged in user
 *
 * @function
 * @author Ahmed Magdy
 * @summary get name of user
 * @property {string} Id id of logged in user
 * @returns {string} name of user 
 */

module.exports.getUserName = async function getUserName(Id) { 
  const user = await User.findById(Id);//gets user by the passed id
  return user.displayName;
}

/**
 * A method that gets album with id passed
 *
 * @function
 * @author Ahmed Magdy
 * @summary gets album
 * @property {string} Id id of album
 * @returns {object} album object with id equals to id passed 
 */

module.exports.getAlbum = async function getAlbum(Id) { 
  const album = await Album.findById(Id);//gets album by the passed id
  return album;
}

/**
 * A method that gets playlist with id passed
 *
 * @function
 * @author Ahmed Magdy
 * @summary gets playlist
 * @property {string} Id id of playlist
 * @returns {object} playlist object with id equals to id passed 
 */

module.exports.getPlaylist = async function getPlaylist(Id) { 
  const playlist = await Playlist.findById(Id);//gets playlist by the passed id
  return playlist;
}

/**
 * A method that creates a comment to passed playlist by the logged in user
 *
 * @function
 * @author Ahmed Magdy
 * @summary make a comment on an playlist
 * @property {object} params An object containing parameter values parsed from the URL path (it contains id of playlist which comment is added to)
 * @param {string} Name name of user looged in
 * @param {object} body An object that holds parameters that are sent up from the client in the request(it contains comment written by user)
 */

module.exports.makePlaylistComment = async function makePlaylistComment(params , Name, body) {
  await PlaylistComments.create({//this create new PlaylistComment object with Name and id and comment passed 
    userName: Name,
    playlistId: params.id,
    comment: body.comment
  });
};

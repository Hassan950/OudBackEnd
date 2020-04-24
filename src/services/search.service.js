const { Album, Playlist, Artist, User, Track, Recent } = require('../models');
const _ = require('lodash');
const mongoose = require('mongoose');

/**
 * A method that searches for what the user searched for
 *
 * @function
 * @author Ahmed Magdy
 * @summary searches for what the user searched for as it takes string the user typed and gets items that the string matches their name if the type is sent then search is for this type if not its on all types
 * @param {Object} query it contains q(string thata user typed),type(optional, if sent then search on this type if not search on all types)
 * @returns {Array} array of items that result from the search process
 */

module.exports.search = async query => {
  let total = 0;
  //if type is sent then search on this type if not search on all types
  switch (query.type) {
    case 'playlist': {
      // if type is playlist then call this function that returns playlits that their name match what user typed
      let playlists = await searchForPlaylists(
        query.q,
        query.offset,
        query.limit,
        total
      );
      return playlists;
    }
    case 'track': {
      // if type is track then call this function that returns tracks that their name match what user typed
      let tracks = await searchForTracks(
        query.q,
        query.offset,
        query.limit,
        total
      );
      return tracks;
    }
    case 'album': {
      // if type is album then call this function that returns albums that their name match what user typed
      let albums = await searchForAlbums(
        query.q,
        query.offset,
        query.limit,
        total
      );
      return albums;
    }
    case 'Artist': {
      // if type is Artist then call this function that returns artists that their displayName match what user typed
      let artists = await searchForArtists(query.q, query.offset, query.limit);
      return artists;
    }
    case 'User': {
      // if type is User then call this function that returns users that their diplayName match what user typed
      let users = await searchForUsers(
        query.q,
        query.offset,
        query.limit,
        total
      );
      return users;
    }
    default: {
      // if type is not sent so the search is on all types
      let playlists = await searchForPlaylists(
        query.q,
        query.offset,
        query.limit,
        total
      );
      let tracks = await searchForTracks(
        query.q,
        query.offset,
        query.limit,
        total
      );
      let albums = await searchForAlbums(
        query.q,
        query.offset,
        query.limit,
        total
      );
      let users = await searchForUsers(
        query.q,
        query.offset,
        query.limit,
        total
      );
      let artists = await searchForArtists(query.q, query.offset, query.limit);
      [playlists, tracks, albums, users, artists] = await Promise.all([
        playlists,
        tracks,
        albums,
        users,
        artists
      ]);
      return { playlists, albums, tracks, users, artists };
    }
  }
};

/**
 * A method that searches for playlists
 *
 * @function
 * @author Ahmed Magdy
 * @summary searches for playlists that their name match what the user typed
 * @param {string} q the string that the user types
 * @param {Number} offset index of the first element to return
 * @param {Number} limit Maximum number of elements in the response
 * @returns {Array} array of playlists that their name match what user types
 */

const searchForPlaylists = async (q, offset, limit, total) => {
  //get all playlists that their name match what usr types and which is public (case insensitive)
  let playlists = Playlist.fuzzySearch(q)
    .where({ public: true })
    .skip(offset) //skips first offset number in array
    .limit(limit) //gets limit number of items
    .populate({
      //get tracks details inside every playlist
      path: 'tracks',
      populate: {
        path: 'album artists',
        select: '-tracks -genres -released -release_date',
        select: 'type displayName images name',
        populate: {
          path: 'artists',
          select: 'type displayName images'
        }
      }
    })
    .exec();
  total = Playlist.fuzzySearch(q)
    .countDocuments({ public: true })
    .exec(); //total of playlists found
  [playlists, total] = await Promise.all([playlists, total]);
  return { playlists, offset, limit, total };
};

/**
 * A method that searches for tracks
 *
 * @function
 * @author Ahmed Magdy
 * @summary searches for tracks that their name match what the user typed
 * @param {string} q the string that the user types
 * @param {Number} offset index of the first element to return
 * @param {Number} limit Maximum number of elements in the response
 * @returns {Array} array of tracks that their name match what user types
 */

const searchForTracks = async (q, offset, limit, total) => {
  //get all tracks that their name match what usr types (case insensitive)
  let tracks = Track.fuzzySearch(q)
    .skip(offset) //skips first offset number in array
    .limit(limit) //gets limit number of items
    .populate(
      //get artists and albums details inside every track
      {
        path: 'artists album',
        select: '-tracks -genres -released -release_date',
        select: 'displayName images type name',
        populate: {
          path: 'artists',
          select: 'type displayName images'
        }
      }
    )
    .exec();
  total = Track.fuzzySearch(q)
    .countDocuments()
    .exec(); //total of tracks found
  [tracks, total] = await Promise.all([tracks, total]);
  return { tracks, offset, limit, total };
};
/**
 * A method that searches for albums
 *
 * @function
 * @author Ahmed Magdy
 * @summary searches for albums that their name match what the user typed
 * @param {string} q the string that the user types
 * @param {Number} offset index of the first element to return
 * @param {Number} limit Maximum number of elements in the response
 * @returns {Array} array of albums that their name match what user types
 */
const searchForAlbums = async (q, offset, limit, total) => {
  //get all albums that their name match what usr types (case insensitive) and is released
  let albums = Album.fuzzySearch(q)
    .where({ released: true })
    .select('-tracks -genres -released -release_date') // unselect tracks,genres,released,released_date
    .skip(offset) //skips first offset number in array
    .limit(limit) //gets limit number of items
    .populate({
      //get artists inside every album
      path: 'artists',
      select: 'displayName type images _id'
    })
    .exec();
  total = Album.fuzzySearch(q)
    .countDocuments({ released: true })
    .exec(); //total of albums found
  [albums, total] = await Promise.all([albums, total]);
  return { albums, offset, limit, total };
};
/**
 * A method that searches for artists
 *
 * @function
 * @author Ahmed Magdy
 * @summary searches for artists that their displayName match what the user typed
 * @param {string} q the string that the user types
 * @param {Number} offset index of the first element to return
 * @param {Number} limit Maximum number of elements in the response
 * @returns {Array} array of artists that their name match what user types
 */
const searchForArtists = async (q, offset, limit) => {
  // let artists = Artist.fuzzySearch(q).skip(offset)//skips first offset number in array
  // .limit(limit)//gets limit number of items
  // .populate(//get genres, popularSongs inside every artist
  //   {
  //     path: 'genres popularSongs',
  //     select: ' name artists image album ',
  //     populate:{
  //       path: ' artists album',
  //       select: '-tracks -genres -released -release_date',
  //       select:'displayName images type name',
  //       populate: {
  //         path:'artists',
  //         select:'type displayName images'
  //       }
  //     }
  //   }
  // ).exec();
  // let artists = Artist.find({
  //   "displayName": { $regex: /^w/, $options: 'i'}
  // })
  const options = {
    skip: offset,
    limit: limit,
    populate: {
      path: 'genres popularSongs',
      select: ' name artists image album ',
      populate: {
        path: ' artists album',
        select: '-tracks -genres -released -release_date',
        select: 'displayName images type name',
        populate: {
          path: 'artists',
          select: 'type displayName images'
        }
      }
    }
  };
  const [artists, total] = await Artist.search(q, options);
  return { artists, offset, limit, total };
};
/**
 * A method that searches for users
 *
 * @function
 * @author Ahmed Magdy
 * @summary searches for users that their displayName match what the user typed
 * @param {string} q the string that the user types
 * @param {Number} offset index of the first element to return
 * @param {Number} limit Maximum number of elements in the response
 * @returns {Array} array of artists that their name match what user types
 */
const searchForUsers = async (q, offset, limit, total) => {
  //get all users that their displayName match what usr types (case insensitive)
  let users = User.fuzzySearch(q)
    .where({ role: { $ne: 'artist' } })
    .select('displayName images verified lastLogin type') //select displayName , images ,verified, lastlogin,type
    .skip(offset) //skips first offset number in array
    .limit(limit) //gets limit number of items
    .exec();
  total = User.fuzzySearch(q)
    .countDocuments({ role: { $ne: 'artist' } })
    .exec(); //total of users found
  [users, total] = await Promise.all([users, total]);
  return { users, offset, limit, total };
};
/**
 * A method that adds item to recently searched for users
 *
 * @function
 * @author Ahmed Magdy
 * @summary adds item to recently searched for users when user clicks on an item from search
 * @param {object} user the logged in user
 * @param {object} body it contains id of the item to be added and its type
 */
module.exports.addToRecent = async (user, body) => {
  // get the Recent object whosh user id is the same as the logged in user
  await Recent.find({ userId: user.id }).updateOne({
    //add the new item and its type at the top of the recently searched array
    $push: {
      items: {
        $each: [body.id],
        $position: 0
      },
      types: {
        $each: [body.type],
        $position: 0
      }
    }
  });
};
/**
 * A method that gets items of recently searched for users
 *
 * @function
 * @author Ahmed Magdy
 * @summary gets items of recently searched for users
 * @param {object} user the logged in user
 * @param {object} query it contains offset (beginning of returned items) and limit(maximum number of returned items)
 */
module.exports.getRecent = async (user, query) => {
  // get the Recent object that its user id is the logged in user id
  let recent = await Recent.findOne({ userId: user.id });
  let i = 0;
  //let the items array of recent object to match limits of (offset,limit)
  let items = _.slice(recent.items, query.offset, query.offset + query.limit);
  //let the types array of recent object to match limits of (offset,limit)
  let types = _.slice(recent.types, query.offset, query.offset + query.limit);
  // loop on items and get each item and its detail
  items = await Promise.all(
    _.map(items, async itemInRecent => {
      //if type of this item is playlist,track,album,Artist or User
      switch (types[i]) {
        case 'playlist': {
          i++;
          // if type is playlist then call the function that gets playlist which this itemid
          const item = await getPlaylist(itemInRecent);
          return item;
        }
        case 'track': {
          i++;
          // if type is track then call the function that gets track which this itemid
          const item = await getTrack(itemInRecent);
          return item;
        }
        case 'album': {
          i++;
          // if type is album then call the function that gets album which this itemid
          const item = await getAlbum(itemInRecent);
          return item;
        }
        case 'Artist': {
          i++;
          // if type is Artist then call the function that gets artist which this itemid
          const item = await getArtist(itemInRecent);
          return item;
        }
        case 'User': {
          i++;
          // if type is User then call the function that gets user which this itemid
          const item = await getUser(itemInRecent);
          return item;
        }
      }
    })
  );
  const offset = query.offset;
  const limit = query.limit;
  // get total of all items that were found in recently searched for this user
  let total = await Recent.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(recent._id) } },
    { $project: { count: { $size: '$items' } } }
  ]);
  total = total[0].count;
  return { items, offset, limit, total };
};
/**
 * A method that gets playlist with a specific id
 *
 * @function
 * @author Ahmed Magdy
 * @summary adds item to recently searched for users when user clicks on an item from search
 * @param {string} id the id of the playlist to find
 * @returns {object} playlist that was found
 */
const getPlaylist = async id => {
  // get the playlist of the sent id
  let playlist = await Playlist.findById(id).populate({
    //get tracks details inside playlist
    path: 'tracks',
    populate: {
      path: 'album artists',
      select: '-tracks -genres -released -release_date',
      select: 'type displayName images name',
      populate: {
        path: 'artists',
        select: 'type displayName images'
      }
    }
  });
  return playlist;
};
/**
 * A method that gets track with a specific id
 *
 * @function
 * @author Ahmed Magdy
 * @summary gets track with a specific id
 * @param {string} id the id of the track to find
 * @returns {object} track that was found
 */
const getTrack = async id => {
  // get the track of the sent id
  let track = await Track.findById(id).populate(
    //get artists, album details inside playlist
    {
      path: 'artists album',
      select: '-tracks -genres -released -release_date',
      select: 'displayName images type name',
      populate: {
        path: 'artists',
        select: 'type displayName images'
      }
    }
  );
  return track;
};
/**
 * A method that gets album with a specific id
 *
 * @function
 * @author Ahmed Magdy
 * @summary gets album with a specific id
 * @param {string} id the id of the album to find
 * @returns {object} album that was found
 */
const getAlbum = async id => {
  // get the album of the sent id
  let album = await Album.findById(id)
    .select('-tracks -genres -released -release_date') //unselect tracks,genres,released,released_date
    .populate({
      //get artists
      path: 'artists',
      select: 'displayName type images _id'
    });
  return album;
};
/**
 * A method that gets artist with a specific id
 *
 * @function
 * @author Ahmed Magdy
 * @summary gets artist with a specific id
 * @param {string} id the id of the artist to find
 * @returns {object} artist that was found
 */
const getArtist = async id => {
  // get the artist of the sent id
  let artist = await Artist.findById(id).populate(
    //get genres,popularSongs details of this artist
    {
      path: 'genres popularSongs',
      select: ' name artists image album ',
      populate: {
        path: ' artists album',
        select: '-tracks -genres -released -release_date',
        select: 'displayName images type name',
        populate: {
          path: 'artists',
          select: 'type displayName images'
        }
      }
    }
  );
  return artist;
};
/**
 * A method that gets user with a specific id
 *
 * @function
 * @author Ahmed Magdy
 * @summary gets user with a specific id
 * @param {string} id the id of the artist to find
 * @returns {object} user that was found
 */
const getUser = async id => {
  // get the user of the sent id
  let user = await User.findById(id).select(
    'displayName images verified lastLogin type'
  ); //select displayName,images,verified,lastLogin,type
  return user;
};

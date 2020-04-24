const { Album, Playlist, Artist, User, Track, Category, Recent } = require('../models');
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
  //if type is sent then search on this type if not search on all types
  switch (query.type) {
    case 'playlist': {
      // if type is playlist then call this function that returns playlits that their name match what user typed
      let playlists = await searchForPlaylists(
        query.q,
        query.offset,
        query.limit
      );
      return playlists;
    }
    case 'track': {
      // if type is track then call this function that returns tracks that their name match what user typed
      let tracks = await searchForTracks(
        query.q,
        query.offset,
        query.limit
      );
      return tracks;
    }
    case 'album': {
      // if type is album then call this function that returns albums that their name match what user typed
      let albums = await searchForAlbums(
        query.q,
        query.offset,
        query.limit
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
        query.limit
      );
      return users;
    }
    default: {
      // if type is not sent so the search is on all types
      let playlists = await searchForPlaylists(
        query.q,
        query.offset,
        query.limit
      );
      let albums = await searchForAlbums(
        query.q,
        query.offset,
        query.limit
      );
      let users = await searchForUsers(
        query.q,
        query.offset,
        query.limit
      );
      let artists = await searchForArtists(
        query.q,
        query.offset,
        query.limit
      );
      let tracks;
      if (artists.artists.length && ((artists.artists[0].displayName).toLowerCase()) === ((query.q).toLowerCase())) {
        tracks = await searchForArtistTracks(
          artists.artists[0]._id,
          query.offset,
          query.limit
        );
      }
      else { 
        tracks = await searchForTracks(
          query.q,
          query.offset,
          query.limit
        );
      }
      let categories = await searchForCategories(
        query.q,
        query.offset,
        query.limit
      );
      [playlists, tracks, albums, users, artists , categories] = await Promise.all([
        playlists,
        tracks,
        albums,
        users,
        artists,
        categories
      ]);
      return { playlists, albums, tracks, users, artists , categories};
    }
  }
};
/**
 * A method that searches for categoriess
 *
 * @function
 * @author Ahmed Magdy
 * @summary searches for categoriess that their name match what the user typed
 * @param {string} q the string that the user types
 * @param {Number} offset index of the first element to return
 * @param {Number} limit Maximum number of elements in the response
 * @returns {Array} array of categories that their name match what user types
 */
const searchForCategories = async (q, offset, limit) => {
  //options that will be done after getting items of search
  const options = {
    select: "-playlists",
    skip: offset,
    limit: limit
  };
  const [categories, total] = await Category.search(q, options);
  return { categories, offset, limit, total };
};
/**
 * A method that searches for tracks of specific artists
 *
 * @function
 * @author Ahmed Magdy
 * @summary searches for tracks of specific artist that their name match what the user typed
 * @param {string} q the string that the user types
 * @param {Number} offset index of the first element to return
 * @param {Number} limit Maximum number of elements in the response
 * @returns {Array} array of tracks that their name match what user types
 */
const searchForArtistTracks = async (id, offset, limit) => {
  //options that will be done after getting items of search
  let tracks = Track.find({ artists: id })
    .populate({//get artists inside every track
      path: 'artists album',
        select: '-tracks -genres -released -release_date',
        select: 'displayName image images type name',
        populate: {
          path: 'artists',
          select: 'type displayName images'
        }
    }).exec();
  let total = Track.countDocuments({ artists: id }).exec();
  [tracks, total] = await Promise.all([tracks , total]);
  return {  tracks, offset, limit, total }
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

const searchForPlaylists = async (q, offset, limit) => {
  //options that will be done after getting items of search
  const options = {
    where: {//playlist should be public
      public: true
    },
    skip: offset,
    limit: limit,
    populate: {//get artists inside every track
      path: 'tracks',
      populate: {
        path: 'album artists',
        select: '-tracks -genres -released -release_date',
        select: 'type displayName image images name',
        populate: {
          path: 'artists',
          select: 'type displayName images'
        }
      }
    }
  };
  const [playlists, total] = await Playlist.search(q, options);
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

const searchForTracks = async (q, offset, limit) => {
  //options that will be done after getting items of search
  const options = {
    skip: offset,
    limit: limit,
    populate: {//get artists inside every track
      path: 'artists album',
        select: '-tracks -genres -released -release_date',
        select: 'displayName image images type name',
        populate: {
          path: 'artists',
          select: 'type displayName images'
        }
    }
  };
  const [tracks, total] = await Track.search(q, options);
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
const searchForAlbums = async (q, offset, limit) => {
  //options that will be done after getting items of search
  const options = {
    where: {
      released: true
    },
    skip: offset,
    limit: limit,
    select: "-tracks -genres -released",
    populate: {//get artists inside every album
      path: 'artists',
      select: 'displayName type images _id'
    }
  };
  const [albums, total] = await Album.search(q, options);
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
  //options that will be done after getting items of search
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
const searchForUsers = async (q, offset, limit) => {
  //options that will be done after getting items of search
  const options = {
    where: {
      role: {
        $ne: 'artist'
      }
    },
    select: 'displayName images verified lastLogin type',
    skip: offset,
    limit: limit
  };
  const [users, total] = await User.search(q, options);
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

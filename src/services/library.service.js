const { likedTracks, likedAlbums, Track, Album, Playlist } = require('../models');
const _ = require('lodash');


/**
 * A method that gets array of boolean to check if track is liked or not
 *
 * @function
 * @author Ahmed Magdy
 * @summary check if track is liked or not by the logged in user if index has true then the track of this index is liked if false then track of this index is unliked
 * @param {Object} user the logged in user
 * @param {Array} ids array of tracks to check if liked or not
 * @returns {Array} array of boolean to check if track is liked or not 
 */

module.exports.checkTracks = async(user , ids)=>{
  //get liked tracks of the user that has ids as the ids sent
  let tracks = await likedTracks.find({track: {$in: ids }},{userId: user.id}).select('track');
  const checks = _.map(ids , (id) =>{ 
    val = tracks.find(like => String(like.track) === id);
    return val !==undefined ;
  });
  return checks;
}

/**
 * A method that gets array of boolean to check if album is liked or not
 *
 * @function
 * @author Ahmed Magdy
 * @summary check if album is liked or not by the logged in user if index has true then the album of this index is liked if false then album of this index is unliked
 * @param {Object} user the logged in user
 * @param {Array} ids array of albums to check if liked or not
 * @returns {Array} array of boolean to check if track is liked or not 
 */

module.exports.checkAlbums = async(user,ids)=>{
  //get liked albums of the user that has ids as the ids sent
  const albums = await likedAlbums.find({album: {$in:ids}},{userId: user.id}).select('album');
  let i = 0;
  const checks = _.map(ids , (id) =>{ 
    val = albums.find(like => String(like.album) === id);
    return val !==undefined ;
  });
  return checks;
}

/**
 * A method that gets array of liked albums
 *
 * @function
 * @author Ahmed Magdy
 * @summary gets array of liked albums by the logged in user 
 * @param {Object} user the logged in user
 * @param {object} query An object containing the URL query parameters it has offset which is the beginning index to return and has limit which is number of items to return
 * @returns {Array} array of liked albums 
 */

module.exports.getAlbums = async(user,query)=>{
  //find all likedalbums which userId is the same as the id of the logged in user and skips the offset sent and returns items whin the limit 
  let result = await likedAlbums.find({userId: user.id})
  .populate({
    path: 'album',
    populate: { path: 'tracks artists genres' ,
    select : 'type displayName images name artists ',
    populate:{
      path: 'artists' ,
      select: 'type displayName images'
  }
  }
  })
  .select('-userId')
  .select('-_id')
  .skip(query.offset)
  .limit(query.limit);
  let lengthArray = likedAlbums.aggregate([
    { $match: { userId: user.id }},
    { $project: { tracks: { $size: '$tracks' } } }
  ]);
  [result, lengthArray] = await Promise.all([result, lengthArray]);
  const albums = result.map(album => {
    album.album.tracks = {
      items: _.slice(album.album.tracks,query.offset, query.offset+ query.limit),
      offset: query.offset,
      limit: query.limit,
      total: album.album.tracks.length
    }
    return album
  })
  const total = await likedAlbums.countDocuments({ userId: user.id });
  return { albums , total};
};

/**
 * A method that gets array of liked tracks
 *
 * @function
 * @author Ahmed Magdy
 * @summary gets array of liked tracks by the logged in user 
 * @param {Object} user the logged in user
 * @param {object} query An object containing the URL query parameters it has offset which is the beginning index to return and has limit which is number of items to return
 * @returns {Array} array of liked tracks 
 */

module.exports.getTracks = async(user,query)=>{
  //find all likedtracks which userId is the same as the id of the logged in user and skips the offset sent and returns items whin the limit 
  let tracks = await likedTracks.find({userId: user.id})
  .populate({
    path:'track',
    populate: {
      path: 'album artists',
      select: '-tracks -genres -released -release_date',
      select: 'type displayName images name album_type',
      populate: {
        path:'artists',
        select:'type displayName images'
      }
    }
  })
  .select('-userId')
  .select('-_id')
  .skip(query.offset)
  .limit(query.limit);
  const total = await likedTracks.countDocuments({userId: user.id});
  return  { tracks,total} ;
}

/**
 * A method that like tracks
 *
 * @function
 * @author Ahmed Magdy
 * @summary like tracks for the logged in user
 * @param {Object} user the logged in user
 * @param {Array} ids array of tracks to like
 */

module.exports.saveTracks = async(user,ids)=>{
  _.map(ids,async(id)=>{
    //get track with the id in this turn
    const track = await Track.findById(id);
    if(track)//if track really exits 
    {
      //then let the user be able to like this track and also add it to user Liked songs playlist
      const playlist = await Playlist.findOne//find the liked songs playlist of this user 
      (
        {owner: user.id},
        {name: 'Liked Songs'}
        )
        .select('tracks')
        .updateOne(
        {
          $push: //add the liked track to the tracks array in the playlist
          {
          tracks: {
            $each: [id],
            $position: 0
          }
          }
        }
      );
      //save the liked track in model Liked Tracks
      await likedTracks.create(
        {
          userId: user.id,
          track: id,
          addedAt: Date.now()
        }
      )
     }
  });
}

/**
 * A method that like albums
 *
 * @function
 * @author Ahmed Magdy
 * @summary like albums for the logged in user
 * @param {Object} user the logged in user
 * @param {Array} ids array of albums to like
 */

module.exports.saveAlbums = async(user,ids)=>{
  _.map(ids,async(id)=>{
    //get album with the id in this turn
    const album = await Album.findById(id); 
    if(album)//if album really exits let the user be able to like track
    {
      await likedAlbums.create(
        {
          userId: user.id,
          album: id,
          addedAt: Date.now()
        }
      )
   }
  }); 
}

/**
 * A method that unlike tracks
 *
 * @function
 * @author Ahmed Magdy
 * @summary unlike trackss for the logged in user
 * @param {Object} user the logged in user
 * @param {Array} ids array of tracks to unlike
 */

module.exports.deleteSavedTracks = async(user,ids)=>{
  await Playlist.findOne//find the liked songs playlist of this user 
      (
        {owner: user.id},
        {name: 'Liked Songs'}
        )
        .updateOne(
        { $pull: //delete tracks with ids like ids of tracks unliked by user
          { tracks: 
            {
               $in: ids 
            } 
          } 
        })
  //delete tracks to be unliked by user from model and playlist that holds the liked tracks
  await likedTracks.deleteMany({track: {$in: ids}},{userId: user.id});
}

/**
 * A method that unlike albums
 *
 * @function
 * @author Ahmed Magdy
 * @summary unlike albums for the logged in user
 * @param {Object} user the logged in user
 * @param {Array} ids array of albums to unlike
 */

module.exports.deleteSavedAlbums = async(user,ids)=>{
  //delete albums to be unliked by user from model that holds the liked albums
  await likedAlbums.deleteMany({album: {$in: ids}},{userId: user.id});
}


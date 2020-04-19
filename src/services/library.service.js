const { likedTracks, likedAlbums, Track, Album } = require('../models');
const _ = require('lodash');

module.exports.checkTracks = async(user , ids)=>{
  let found = [];
  const tracks = await likedTracks.find({track: {$in:ids}},{userId: user.id}).select('track');
  let i = 0;
  _.map(ids , id =>{
    if(!tracks[i])
    {
      found.push(false);
    }
    else {
      found.push(true);
    }
    i++;
  });
  return found;
}

module.exports.checkAlbums = async(user,ids)=>{
  let found = [];
  const albums = await likedAlbums.find({album: {$in:ids}},{userId: user.id}).select('album');
  let i = 0;
  _.map(ids , id =>{
    if(!albums[i])
    {
      found.push(false);
    }
    else {
      found.push(true);
    }
    i++;
  });
  return found;
}

module.exports.getAlbums = async(user,query)=>{
  const albums = await likedAlbums.find({userId: user.id}).populate('album').select('-userId').select('-_id').skip(query.offset).limit(query.limit);
  return albums;
}

module.exports.getTracks = async(user,query)=>{
  let tracks = await likedTracks.find({userId: user.id}).populate('track').select('-userId').select('-_id').skip(query.offset).limit(query.limit);
  return  tracks ;
}

module.exports.saveTracks = async(user,ids)=>{
  _.map(ids,async(id)=>{
    const track = await Track.findById(id);
    if(track){
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

module.exports.saveAlbums = async(user,ids)=>{
  _.map(ids,async(id)=>{
    const album = await Album.findById(id); 
    if(album){
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
module.exports.deleteSavedTracks = async(user,ids)=>{
  await likedTracks.deleteMany({userId: user.id},{track: {$in: ids}});
}

module.exports.deleteSavedAlbums = async(user,ids)=>{
  await likedAlbums.deleteMany({userId: user.id},{track: {$in: ids}});
}


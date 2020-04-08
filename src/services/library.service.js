const { likedTracks, likedAlbums } = require('../models');
const _ = require('lodash');

module.exports.checkTracks = async(ids)=>{
  let found = [];
  const tracks = await likedTracks.find({_id: {$in:ids}});
  let i = 0;
  _.map(tracks , track =>{
    if(track._id == ids[i]){
      found.push(true);
    }
    else{
      found.push(false);
    }
    i++;
  });
  return found;
}

module.exports.checkAlbums = async(ids)=>{
  let found = [];
  const albums = await likedAlbums.find({_id: {$in:ids}});
  let i = 0;
  _.map(albums , album =>{
    if(album._id == ids[i]){
      found.push(true);
    }
    else{
      found.push(false);
    }
    i++;
  });
  return found;
}
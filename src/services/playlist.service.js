const {Playlist } = require('../models');


const getPlaylist =  async (params) => {
  const playlist = await Playlist.findById(params.id);
  return playlist ;
}

const changePlaylist = async (params , body) =>{
  const playlist = await Playlist.findById(params.id);
  if(!playlist) return playlist;
  playlist.name = body.name;
  playlist.collabrative = body.collabrative;
  playlist.description = body.description;
  playlist.public = body.public;
  return playlist; 
}

const uploadImage = async(params, body)=>{
  const playlist = await Playlist.findById(params.id);
  if(!playlist) return playlist;
  playlist.image = body.image;
  return playlist ;
}

const getTracks = async(params , query)=>{
  const tracks = await Playlist.findById(params.id).populate('tracks').skip(query.offset).limit(query.limit);
  if(!tracks){const total = 0 ;
    return{ tracks , total };
  }
  const total = tracks.length; 
  return {tracks , total};
}

module.exports = {
  getPlaylist,
  changePlaylist,
  uploadImage,
  getTracks
}
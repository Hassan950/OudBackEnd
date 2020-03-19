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

const getUserPlaylists = async(params , query)=>{
  const playlists = await Playlist.find({owner: params.id}).select('-owner').skip(query.offset).limit(query.limit);
  if(!playlists){const total = 0 ;
    return{ playlists , total };
  }
  const total = playlists.length; 
  return {playlists , total};
}

const createUserPlaylist = async(params , body)=>{
  const playlist = new Playlist({
    name : body.name ,
    public :  body.public ,
    collabrative : body.collabrative,
    description : body.description,
    owner : params.id
  });
  playlist.save();
}

const deleteTracks = async(params , body)=>{
  let playlist = await Playlist.findById(params.id);
  if(!playlist)return playlist;
  let valuesToRemove = body.tracks;
  let notFound = [];
  valuesToRemove.forEach(element => {
    if(!playlist.tracks.includes(element)) notFound.push(element);
  });
  valuesToRemove = valuesToRemove.filter(item => !notFound.includes(item));
  playlist.tracks = playlist.tracks.filter(item => !valuesToRemove.includes(item));
  playlist.save();
  return playlist;
}

module.exports = {
  getPlaylist,
  changePlaylist,
  uploadImage,
  getTracks,
  getUserPlaylists,
  createUserPlaylist,
  deleteTracks
}
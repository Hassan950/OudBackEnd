const { Playlist ,Track, User } = require('../models');


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
  return {  tracks , total  };
}

const getUserPlaylists = async(params , query)=>{
  const playlists = await Playlist.find({owner: params.id}).select('-owner').skip(query.offset).limit(query.limit);
  const total = (await Playlist.find({owner: params.id})).length;
  return {  playlists , total };
}

const getTracksID =async(uris)=>{
  const tracks = await Track.find({audioUrl :{$in: uris} }).select("_id");
  return tracks;
}


const checkUser = async(parmas)=>
{
  const user = await  User.findById(params.id);
  return user;
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
  let found = [];
  body.forEach(element => {
    if(playlist.tracks.includes(element.id)) found.push(element.id);
  });
  playlist.tracks = playlist.tracks.filter(item => found.includes(item));
  playlist.save();
  return playlist;
}

const addTracks = async(params , tracks , position)=>{
  let playlist = await Playlist.findById(params.id);
  if(!playlist)return playlist;
  let trackPosition = position ;
  tracks.forEach(element => {
    playlist.tracks.splice(playlist.tracks , trackPosition , element.id);
    trackPosition++;
  });
  playlist.save();
  return playlist
}

module.exports = {
  getPlaylist,
  changePlaylist,
  uploadImage,
  getTracks,
  getUserPlaylists,
  createUserPlaylist,
  deleteTracks,
  getTracksID,
  addTracks,
  checkUser
}
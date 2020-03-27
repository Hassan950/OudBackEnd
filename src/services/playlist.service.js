const { Playlist ,Track, User } = require('../models');
const fs  = require('fs');


const getPlaylist =  async (params) => {
  const playlist = await Playlist.findById(params.id);
  return playlist ;
}

const changePlaylist = async (params , body, image) =>{
  let playlist = await Playlist.findByIdAndUpdate(params.id,{ $set:  {'name':  body.name,'collabrative':  body.collabrative,
    'description':  body.description,
    'public': body.public}},{new: true});
  if(!playlist) return playlist;
  if(!image)return playlist;
  const path = playlist.image;
  if(path != image  && path != 'uploads\\default.jpg'){
    fs.unlink(`${path}`, err => {
      if (err) throw err;
    })
  }
  playlist = await Playlist.findByIdAndUpdate(params.id,{
    image: image
  },
  { new: true });
  
  return playlist; 
}

const uploadImage = async(params, image)=>{
  let playlist = await Playlist.findById(params.id);
  const path = playlist.image
  if(path != image){
    fs.unlink(`${path}`, err => {
      if (err) throw err;
    })
  }
  playlist = await Playlist.findByIdAndUpdate(params.id,{
    image: image
  },
  { new: true });
  if(!playlist) return playlist;
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


const checkUser = async(params)=>
{
  const user = await  User.findById(params.id);
  return user;
}

const createUserPlaylist = async(params , body, image)=>{
  const playlist = new Playlist({
    name : body.name ,
    public :  body.public ,
    collabrative : body.collabrative,
    description : body.description,
    owner : params.id,
    image: image
  });
  playlist.save();
  return playlist;
}

const deleteTracks = async(params , body)=>{
  let playlist = await Playlist.findById(params.id);
  if(!playlist)return playlist;
  const tracks = playlist.tracks;
  playlist = await Playlist.findByIdAndUpdate(params.id, {  $pull: {  'tracks': { $in: tracks }}});
  playlist.save();
  return playlist;
}

const addTracks = async(params , tracks , position)=>{
  let playlist = await Playlist.findById(params.id);
  if(!playlist)return playlist;
  const notFound = [];
  tracks.forEach(element => {
    if(!playlist.tracks.includes(element.id)){
      notFound.push(element);
    }
  });
  playlist = await Playlist.findByIdAndUpdate(params.id, 
    {  $push: 
      {
        'tracks': {
          $each: notFound,
          $position: position
        }
      }
    });
  playlist.save();
  return playlist
}

const reorderTracks = async()=>{
  const playlist = await Playlist.findById()
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
  checkUser,
  reorderTracks
}
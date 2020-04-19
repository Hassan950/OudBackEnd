const { Album, Playlist,Artist,User,Track } = require('../models');
const mongoose = require('mongoose');

module.exports.search = async (query)=> {
  if(!(query.type))
  {
    const playlists = await Playlist.find({ name: { $regex:  query.q , $options: 'i'}}).populate('tracks') ;
    const albums = await Album.find({ name: { $regex:  query.q , $options: 'i'}});
    const tracks = await Track.find({ name: { $regex:  query.q , $options: 'i'}});
    const users = await User.find({ displayName: { $regex:  query.q , $options: 'i'}});
    const artists = await Artist.find({ displayName: { $regex:  query.q , $options: 'i'}});
    return {  playlists , albums, tracks, users , artists };
  }
  else if ((query.type)=='playlist')
  {
    const playlists = await Playlist.find({ name: { $regex:  query.q , $options: 'i'}}).populate('tracks') ;
    return { playlists } ;
  }
  else if ((query.type)=='track')
  {
    const tracks = await Track.find({ name: { $regex:  query.q , $options: 'i'}});
    return { tracks } ;
  }
  else if ((query.type)=='album')
  {
    const albums = await Album.find({ name: { $regex:  query.q , $options: 'i'}});
    return { albums } ;
  }

};
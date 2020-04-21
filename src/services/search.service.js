const { Album, Playlist,Artist,User,Track } = require('../models');
const mongoose = require('mongoose');

module.exports.search = async (query)=> {
  const offset = query.offset ;
  const limit = query.limit;
  let total = 0;
  if(!(query.type))
  {
    let playlists = await getPLaylists(query.q,query.offset,query.limit,total);
    let tracks = await getTracks(query.q,query.offset,query.limit,total);
    let albums = await getAlbums(query.q,query.offset,query.limit,total);
    let users = await getUsers(query.q,query.offset,query.limit,total);
    let artists = await getArtists(query.q,query.offset,query.limit,total);
    [playlists,tracks,albums,users,artists] = await Promise.all([playlists, tracks,albums,users,artists]);
    return {  playlists , albums, tracks, users , artists };
  }
  else if ((query.type)=='playlist')
  {
    let playlists = await getPLaylists(query.q,query.offset,query.limit,total);
    return playlists;
  }
  else if ((query.type)=='track')
  {
    let tracks = await getTracks(query.q,query.offset,query.limit,total);
    return tracks ;
  }
  else if ((query.type)=='album')
  {
    let albums = await getAlbums(query.q,query.offset,query.limit,total);
    return albums ;
  }
  else if ((query.type)=='Artist')
  {
    let artists = await getArtists(query.q,query.offset,query.limit,total);
    return artists ;
  }
  else if ((query.type)=='User')
  {
    let users = await getUsers(query.q,query.offset,query.limit,total);
    return users;
  }

};

const getPLaylists = async(q,offset,limit,total)=>{
  let playlists = await Playlist.find({ name: { $regex:  q , $options: 'i'}})
  .skip(offset)
  .limit(limit)
  .populate({
    path:'tracks',
    populate: {
      path: 'album artists',
      select: '-tracks -genres -released -release_date',
      select: 'type displayName images name',
      populate: {
        path:'artists',
        select:'type displayName images'
      }
    }
  }).exec()
  total = await Playlist.countDocuments({ name: { $regex:  q , $options: 'i'}}).exec();
  [playlists,total] = await Promise.all([playlists,total]);
  return {  playlists ,offset,limit, total };
}

const getTracks = async(q,offset,limit,total)=>{
  let tracks = await Track.find({ name: { $regex:  q , $options: 'i'}})
  .skip(offset)
  .limit(limit)
  .populate(
    {
      path: 'artists album',
      select: '-tracks -genres -released -release_date',
      select:'displayName images type name',
      populate: {
        path:'artists',
        select:'type displayName images'
      }
    }).exec();
  total = await Track.countDocuments({ name: { $regex:  q , $options: 'i'}}).exec();
  [tracks,total] = await Promise.all([tracks,total]);
  return { tracks,offset,limit, total };
}

const getAlbums = async(q,offset,limit,total)=>{
  let albums = await Album.find({ name: { $regex:  q , $options: 'i'}})
  .select('-tracks -genres -released -release_date')
  .skip(offset)
  .limit(limit)
  .populate({
    path:'artists',
    select: 'displayName type images _id',
  })
  .exec();
  total = await Album.countDocuments({ name: { $regex:  q , $options: 'i'}}).exec();
  [albums,total] = await Promise.all([albums,total]);
  return {  albums,offset,limit,total };
}

const getArtists = async(q,offset,limit,total)=>{
  let artists = await Artist.find({ displayName: { $regex:  q , $options: 'i'}})
  .skip(offset)
  .limit(limit)
  .populate(
    {
      path: 'genres popularSongs',
      select: ' name artists image album ',
      populate:{
        path: ' artists album',
        select: '-tracks -genres -released -release_date',
        select:'displayName images type name',
        populate: {
          path:'artists',
          select:'type displayName images'
        }
      }
    }
  )
  .exec();
  total = await Artist.countDocuments({ displayName: { $regex:  q , $options: 'i'}}).exec();
  [artists,total] = await Promise.all([artists,total]);
  return {  artists,offset,limit,total };
}

const getUsers = async(q,offset,limit,total)=>{
  let users = await User.find({ displayName: { $regex:  q , $options: 'i'}})
  .select('displayName images verified lastLogin type')
  .skip(offset)
  .limit(limit)
  .exec();
  total = await User.countDocuments({ displayName: { $regex:  q , $options: 'i'}}).exec();
  [users,total] = await Promise.all([users,total]);
  return {  users,offset,limit,total };;
}

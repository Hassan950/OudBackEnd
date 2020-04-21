const { Album, Playlist,Artist,User,Track } = require('../models');
const mongoose = require('mongoose');

module.exports.search = async (query)=> {
  const offset = query.offset ;
  const limit = query.limit;
  let total = 0;
  if(!(query.type))
  {
    let playlists = await getPLaylists(query,total);
    let tracks = await getTracks(query,total);
    let albums = await getAlbums(query,total);
    let users = await getUsers(query,total);
    let artists = await getArtists(query,total);
    [playlists,tracks,albums,users,artists] = await Promise.all([playlists, tracks,albums,users,artists]);
    total += playlists.total + tracks.total + albums.total + artists.total + users.total;
    playlists = playlists.playlists;
    tracks = tracks.tracks;
    albums = albums.albums;
    artists = artists.artists;
    users = users.users;
    return {  playlists , albums, tracks, users , artists , offset , limit,total };
  }
  else if ((query.type)=='playlist')
  {
    let playlists = await getPLaylists(query,total);
    total += playlists.total;
    playlists = playlists.playlists;
    return { playlists, offset , limit, total } ;
  }
  else if ((query.type)=='track')
  {
    let tracks = await getTracks(query,total);
    total += tracks.total;
    tracks = tracks.tracks;
    return { tracks , offset ,limit , total } ;
  }
  else if ((query.type)=='album')
  {
    let albums = await getAlbums(query,total);
    total += albums.total;
    albums = albums.albums;
    return { albums,offset,limit,total } ;
  }
  else if ((query.type)=='Artist')
  {
    let artists = await getArtists(query,total);
    total += artists.total;
    artists = artists.artists;
    return { artists,offset,limit,total } ;
  }
  else if ((query.type)=='User')
  {
    let users = await getUsers(query,total);
    total += users.total;
    users = users.users;
    return { users,offset,limit,total } ;
  }

};

const getPLaylists = async(query,total)=>{
  let playlists = await Playlist.find({ name: { $regex:  query.q , $options: 'i'}})
  .skip(query.offset)
  .limit(query.limit)
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
  total = await Playlist.countDocuments({ name: { $regex:  query.q , $options: 'i'}}).exec();
  [playlists,total] = await Promise.all([playlists,total]);
  return {  playlists , total };
}

const getTracks = async(query,total)=>{
  let tracks = await Track.find({ name: { $regex:  query.q , $options: 'i'}})
  .skip(query.offset)
  .limit(query.limit)
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
  total = await Track.countDocuments({ name: { $regex:  query.q , $options: 'i'}}).exec();
  [tracks,total] = await Promise.all([tracks,total]);
  return { tracks, total };
}

const getAlbums = async(query,total)=>{
  let albums = await Album.find({ name: { $regex:  query.q , $options: 'i'}})
  .select('-tracks -genres -released -release_date')
  .skip(query.offset)
  .limit(query.limit)
  .populate({
    path:'artists',
    select: 'displayName type images _id',
  })
  .exec();
  total = await Album.countDocuments({ name: { $regex:  query.q , $options: 'i'}}).exec();
  [albums,total] = await Promise.all([albums,total]);
  return {  albums,total };
}

const getArtists = async(query,total)=>{
  let artists = await Artist.find({ displayName: { $regex:  query.q , $options: 'i'}})
  .skip(query.offset)
  .limit(query.limit)
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
  total = await Artist.countDocuments({ displayName: { $regex:  query.q , $options: 'i'}}).exec();
  [artists,total] = await Promise.all([artists,total]);
  return {  artists,total };
}

const getUsers = async(query,total)=>{
  let users = await User.find({ displayName: { $regex:  query.q , $options: 'i'}})
  .select('displayName images verified lastLogin type')
  .skip(query.offset)
  .limit(query.limit)
  .exec();
  total = await User.countDocuments({ displayName: { $regex:  query.q , $options: 'i'}}).exec();
  [users,total] = await Promise.all([users,total]);
  return {  users,total };;
}

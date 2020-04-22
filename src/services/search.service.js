const { Album, Playlist, Artist, User, Track, Recent } = require('../models');
const _ = require('lodash');
const mongoose = require('mongoose');

module.exports.search = async (query)=> {
  let total = 0;
  switch(query.type){
    case 'playlist':{
      let playlists = await searchForPlaylists(query.q,query.offset,query.limit,total);
      return playlists;
    }
    case 'track':{
      let tracks = await searchForTracks(query.q,query.offset,query.limit,total);
      return tracks ;
    }
    case 'album':{
      let albums = await searchForAlbums(query.q,query.offset,query.limit,total);
      return albums ;
    }
    case 'Artist':{
      let artists = await searchForArtists(query.q,query.offset,query.limit,total);
      return artists ;
    }
    case 'User':{
      let users = await searchForUsers(query.q,query.offset,query.limit,total);
      return users;
    }
    default:{
      let playlists = await searchForPlaylists(query.q,query.offset,query.limit,total);
      let tracks = await searchForTracks(query.q,query.offset,query.limit,total);
      let albums = await searchForAlbums(query.q,query.offset,query.limit,total);
      let users = await searchForUsers(query.q,query.offset,query.limit,total);
      let artists = await searchForArtists(query.q,query.offset,query.limit,total);
      [playlists,tracks,albums,users,artists] = await Promise.all([playlists, tracks,albums,users,artists]);
      return {  playlists , albums, tracks, users , artists };
    }
  }
};
const searchForPlaylists = async(q,offset,limit,total)=>{
  let playlists = await Playlist.find({ name: { $regex:  q , $options: 'i'}}, { public: true} )
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

const searchForTracks = async(q,offset,limit,total)=>{
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

const searchForAlbums = async(q,offset,limit,total)=>{
  let albums = await Album.find({ name: { $regex:  q , $options: 'i'}},{  released: true})
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

const searchForArtists = async(q,offset,limit,total)=>{
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

const searchForUsers = async(q,offset,limit,total)=>{
  let users = await User.find({ displayName: { $regex:  q , $options: 'i'}})
  .select('displayName images verified lastLogin type')
  .skip(offset)
  .limit(limit)
  .exec();
  total = await User.countDocuments({ displayName: { $regex:  q , $options: 'i'}}).exec();
  [users,total] = await Promise.all([users,total]);
  return {  users,offset,limit,total };;
}

module.exports.addToRecent = async(user,body)=>{
  await Recent.find({userId: user.id})
  .updateOne({
      $push: {
        items: {
          $each: [body.id],
          $position: 0
        },
        types: {
          $each: [body.type],
          $position: 0
        }
      }
    }
  );
}

module.exports.getRecent = async (user,query)=>{
  let recent = await Recent.findOne({userId: user.id});
  let i =0 ;
  let items = _.slice(recent.items,query.offset, query.offset+ query.limit);
  let types = _.slice(recent.types,query.offset, query.offset+ query.limit);
  items =await Promise.all( _.map(items , async(itemInRecent)=>
  {
    switch(types[i]){
      case 'playlist':{
        i++;
        const item = await getPlaylist(itemInRecent);
        return item;
      }
      case 'track':{
        i++;
        const item = await getTrack(itemInRecent);
        return item;
      }
      case 'album':{
        i++;
        const item = await getAlbum(itemInRecent);
        return item;
      }
      case 'Artist':{
        i++;
        const item = await getArtist(itemInRecent);
        return item;
      }
      case 'User':{
        i++;
        const item = await getUser(itemInRecent);
        return item;
      }
    }
  }))
  const offset = query.offset;
  const limit  = query.limit;
  let total = await Recent.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(recent._id) } },
    { $project: { count: { $size: '$items' } } }]);
  total = total[0].count;  
  return { items , offset , limit , total };
}

const getPlaylist = async(id)=>{
  let playlist = await Playlist.findById(id)
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
  })
  return playlist ;
}

const getTrack = async(id)=>{
  let track = await Track.findById(id)
  .populate(
    {
      path: 'artists album',
      select: '-tracks -genres -released -release_date',
      select:'displayName images type name',
      populate: {
        path:'artists',
        select:'type displayName images'
      }
    })
  return track ;
}
const getAlbum = async(id)=>{
  let album = await Album.findById(id)
  .select('-tracks -genres -released -release_date')
  .populate({
    path:'artists',
    select: 'displayName type images _id',
  })
  return album;
}

const getArtist = async(id)=>{
  let artist = await Artist.findById(id)
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
  return artist ;
}

const getUser = async(id)=>{
  let user = await User.findById(id)
  .select('displayName images verified lastLogin type')
  return user;
}

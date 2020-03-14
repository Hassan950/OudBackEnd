const _ = require('lodash');
const { trackService } = require('../services');

// exports.addtrack = async (req, res, next) => {
//   // To Do
//   // parse the request body and get the input

//   const track = new Track({name: 'mohamed', artists: ['5e595b46b556fa38fc0df196'], album: '5e595b46b556fa38fc0df196', audiUrl: '/Downloads/ER.mp3'});
//   return await track.save();
// }

exports.getTrack = async (req, res, next) => {
  const track = await trackService.findTrack(req.params.id);
  res.status(200).send(track);
};

exports.getTracks = async (req, res, next) => {
  console.log(req.query)
  let ids = req.query.ids.split(',');
  const tracks = await trackService.findTracks(ids);
  res.status(200).send(tracks);
};

exports.deleteTrack = async (req, res, next) => {
  const track = await trackService.deleteTrack(req.params.id);
  res.status(200).send(track);
};

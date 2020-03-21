const _ = require('lodash');

class TrackMocks {
  constructor(name, artists, album, audioUrl, duration, _id) {
    this.name = name;
    this.artists = artists;
    this.album = album;
    this.audioUrl = audioUrl;
    this.duration = duration;
    this._id = _id;
  }
  save() {
    return new Promise((resolve, reject) => {
      resolve(this);
    });
  }

  static find({ _id: ids }) {
    let result = [];
    ids = [...new Set(ids)];
    for (let i = 0; i < ids.length; i++) {
      const val = tracks.find(track => track._id == ids[i]);
      if (val) result.push(val);
    }
    return new Promise((resolve, reject) => {
      resolve(result);
    });
  }

  set(newTrack) {
    for (let key in newTrack) {
      this[key] = newTrack[key];
    }
    return new Promise((resolve, reject) => {
      resolve(this);
    });
  }

  static findByIdAndDelete(id) {
    const trackIndex = tracks.findIndex(track => track._id == id);
    if (trackIndex == -1) return null;
    const track = tracks[trackIndex];
    tracks.splice(trackIndex, 1);
    return new Promise((resolve, reject) => {
      resolve(track);
    });
  }

  static findById(id) {
    const track = tracks.find(track => track._id == id);
    return new Promise((resolve, reject) => {
      resolve(track);
    });
  }

  static findByIdAndUpdate(id, newTrack, { new: option }) {
    const trackIndex = tracks.findIndex(track => track._id == id);
    if (trackIndex == -1) return null;
    for (let key in newTrack) {
      tracks[trackIndex][key] = newTrack[key];
    }
    return new Promise((resolve, reject) => {
      resolve(tracks[trackIndex]);
    });
  }
}

artistids = [
  '5e6c8ebb8b40fc5508fe8b32',
  '5e6c8ebb8b40fc6608fe8b32',
  '5e6c8ebb8b40fc7708fe8b32'
];
trackids = [
  '5e6c8ebb8b40fc5508fe8b32',
  '5e6f6a7fac1d6d06f40706f2',
  '5e6c8ebb8b40fc5518fe8b32'
];

let tracks = [
  new TrackMocks(
    'mohamed',
    [artistids[0], artistids[1]],
    'idalbum',
    'shit.mp3',
    30000,
    trackids[0]
  ),
  new TrackMocks(
    'mohamed',
    [artistids[1], artistids[2]],
    'idalbum',
    'shit.mp3',
    30000,
    trackids[1]
  ),
  new TrackMocks(
    'mohamed',
    [artistids[2], artistids[0]],
    'idalbum',
    'shit.mp3',
    30000,
    trackids[2]
  )
];

module.exports = {
  TrackMocks,
  artistids,
  trackids
};

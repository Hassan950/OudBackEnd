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
    return this;
  }
  // To Do
  // static functions
  // findbyidanddelete , findbyid, findbyidandupdate
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
}

let tracks = [
  new TrackMocks(
    'mohamed',
    ['5e6c8ebb8b40fc5508fe8b32', 'id2'],
    'idalbum',
    'shit.mp3',
    30000,
    '5e6c8ebb8b40fc5508fe8b32'
  ),
  new TrackMocks(
    'mohamed',
    ['id1', 'id2'],
    'idalbum',
    'shit.mp3',
    30000,
    '5e6f6a7fac1d6d06f40706f2'
  ),
  new TrackMocks(
    'mohamed',
    ['id1', 'id2'],
    'idalbum',
    'shit.mp3',
    30000,
    '5e6c8ebb8b40fc5508fe8b32'
  )
];

module.exports = {
  TrackMocks,
  tracks
};

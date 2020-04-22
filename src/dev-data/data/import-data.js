const fs = require('fs');
const mongoose = require('mongoose');
const config = require('config');
const {
  User,
  Player,
  Genre,
  Artist,
  Album,
  Track,
  Category,
  Playlist,
  Queue,
  PlayHistory,
  Normal,
  Ad
} = require('../../models');

const DB = config.get('db');

// READ JSON FILE
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

const players = JSON.parse(
  fs.readFileSync(`${__dirname}/players.json`, 'utf-8')
);

const genres = JSON.parse(fs.readFileSync(`${__dirname}/genres.json`, 'utf-8'));
const artists = JSON.parse(
  fs.readFileSync(`${__dirname}/artists.json`, 'utf-8')
);

const albums = JSON.parse(fs.readFileSync(`${__dirname}/albums.json`, 'utf-8'));

const tracks = JSON.parse(fs.readFileSync(`${__dirname}/tracks.json`), 'utf-8');

const ads = JSON.parse(fs.readFileSync(`${__dirname}/ads.json`), 'utf-8');

const categories = JSON.parse(
  fs.readFileSync(`${__dirname}/categories.json`, 'utf-8')
);

const playlists = JSON.parse(
  fs.readFileSync(`${__dirname}/playlists.json`, 'utf-8')
);

const playhistories = JSON.parse(
  fs.readFileSync(`${__dirname}/playhistories.json`, 'utf-8')
);

const queues = JSON.parse(
  fs.readFileSync(`${__dirname}/queues.json`, 'utf-8')
);
// IMPORT DATA INTO DB
const importData = async () => {
  try {
    const connection = await mongoose
      .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
      });
    console.log('DB connection successful!');
    await Player.create(players);
    await Normal.create(users);
    await Genre.create(genres);
    await Artist.create(artists);
    await Album.create(albums);
    await Track.create(tracks);
    await Category.create(categories);
    await Playlist.create(playlists);
    await Queue.create(queues);
    //await PlayHistory.create(playhistories);
    await Ad.create(ads);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    const connection = await mongoose
      .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
      });
    console.log('DB connection successful!');
    await connection.connection.db.dropDatabase();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

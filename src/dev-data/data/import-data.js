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
  Playlist
} = require('../../models');

const DB = config.get('db');
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'));

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
const categories = JSON.parse(
  fs.readFileSync(`${__dirname}/categories.json`, 'utf-8')
);

const playlists = JSON.parse(
  fs.readFileSync(`${__dirname}/playlists.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await User.create(users);
    await Genre.create(genres);
    await Artist.create(artists);
    await Album.create(albums);
    await Track.create(tracks);
    await Player.create(players);
    await Category.create(categories);
    await Playlist.create(playlists);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Player.deleteMany();
    await Genre.deleteMany();
    await Artist.deleteMany();
    await Album.deleteMany();
    await Track.deleteMany();
    await Category.deleteMany();
    await Playlist.deleteMany();
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

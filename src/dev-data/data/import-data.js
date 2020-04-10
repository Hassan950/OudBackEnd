const fs = require('fs');
const mongoose = require('mongoose');
const config = require('config');
const { User, Player, Genre, Artist } = require('../../models');

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

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await User.create(users);
    //await Player.create(players);
    await Genre.create(genres);
    await Artist.create(artists);
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

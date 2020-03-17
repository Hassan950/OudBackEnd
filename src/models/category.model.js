const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'category should have a name'],
    minlength: 3,
    maxlength: 20,
    trim: true,
    unique: [true, 'this category name  already exits']
},
  icon: {
    type: String,
    required: [true, 'the category should have an icon'],
    trim: true,
  },
  playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }]
  });

categorySchema.virtual('type').get(function () {
  return 'category';
});

const Category = mongoose.model('Category', categorySchema);
module.exports = { Category, categorySchema };
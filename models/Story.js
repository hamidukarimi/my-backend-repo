const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',      // Reference to User model
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,     // ImgBB URL
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Story', storySchema);

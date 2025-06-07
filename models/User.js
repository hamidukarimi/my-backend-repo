const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  category: { type: String, required: true, trim: true },
  imagePath: { type: String, trim: true },
  date: { type: Date, default: Date.now },

  likes: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      profilePicture: { type: String }
    }
  ]
});



// Step 2: Define the main user schema
const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  lastName: String,
  email: String,
  password: String,
  profilePicture: { type: String, default: null }, // ✅ clearer
  backgroundPicture: { type: String, default: null },
  bio: String,
  gender: String,
  location: String,
  website: String,
  followers: String,
  following: String,
  posts: [postSchema] // embedded posts
});


module.exports = mongoose.model("User", userSchema);

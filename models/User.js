const mongoose = require("mongoose");

// Post schema
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

// 🛒 Cart Item Schema (embedded inside user)
const cartItemSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, required: true }, // reference to post
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  imagePath: { type: String }
}, { _id: false }); // disabling _id for cart items if you prefer

// Main user schema
const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  lastName: String,
  email: String,
  password: String,
  profilePicture: { type: String, default: null },
  backgroundPicture: { type: String, default: null },
  bio: String,
  gender: String,
  location: String,
  website: String,
  followers: String,
  following: String,
  posts: [postSchema],     // ✅ Embedded posts
  cart: [cartItemSchema]   // ✅ Embedded cart items
});

module.exports = mongoose.model("User", userSchema);

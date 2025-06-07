const fs = require('fs');
const axios = require('axios');
const uploadToImgBB = require('../utils/uploadToImgBB'); // ✅ import ImgBB uploader
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const path = require("path");
const FormData = require("form-data");


const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const file = req.file;

    let profileUrl = '';
    if (file) {
      profileUrl = await uploadToImgBB(file.path, file.originalname);
    }

    const newUser = new User({
      username,
      email,
      password,
      profilePicture: profileUrl, // 👈 store imgbb URL
    });

    await newUser.save();
    res.status(201).json({ message: "User registered!", user: newUser });

  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ message: "Registration failed." });
  }
};

// const insertUser = async (req, res) => {
//   try {
//     const userData = req.body;

//     // ✅ Handle profile picture file upload
//     let profilePicturePath = null;
//     if (req.file) {
//       profilePicturePath = `/uploads/profiles/${req.file.filename}`;
//     }

//     // Include uploaded profile picture path if available
//     const newUser = await User.create({
//       ...userData,
//       profilePicture: profilePicturePath, // will be null if not uploaded
//     });

//     // Generate JWT token for the new user
//     const token = jwt.sign(
//       { id: newUser._id, email: newUser.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     // Exclude password from user object
//     const { password: _, ...userWithoutPassword } = newUser.toObject();

//     res.status(201).json({
//       message: "✅ User created and logged in",
//       token,
//       user: userWithoutPassword,
//     });
//   } catch (err) {
//     console.error("❌ Error inserting user:", err);
//     res.status(500).json({ error: "❌ Failed to insert user" });
//   }
// };



// second version for storing the profilePicture


 // adjust path if different

const insertUser = async (req, res) => {
  try {
    const userData = req.body;

    // ✅ Upload to ImgBB if a profile picture was uploaded
    let profilePictureUrl = null;

    if (req.file) {
      const filePath = path.join(__dirname, "..", "uploads", "profiles", req.file.filename);
      const fileBuffer = fs.readFileSync(filePath);

      const form = new FormData();
      form.append("image", fileBuffer.toString("base64"));

      const imgbbRes = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        form,
        { headers: form.getHeaders() }
      );

      profilePictureUrl = imgbbRes.data.data.url;

      // ✅ Remove the local file after upload
      fs.unlinkSync(filePath);
    }

    // ✅ Create user with ImgBB image URL
    const newUser = await User.create({
      ...userData,
      profilePicture: profilePictureUrl, // now stores full ImgBB URL
    });

    // ✅ JWT Token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Exclude password in response
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({
      message: "✅ User created and logged in",
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("❌ Error inserting user:", err);
    res.status(500).json({ error: "❌ Failed to insert user" });
  }
};




const signInUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // You should verify password here (hash compare, etc)
    if (password !== user.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error("❌ Error signing in user:", err);
    res.status(500).json({ error: "Failed to sign in" });
  }
};

// GET: a specific user's data
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({ error: "❌ User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ error: "❌ Failed to fetch user" });
  }
};

// POST: Add a new post to a user's embedded posts
// const addPostToUser = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { name, description, price, category } = req.body;

//     // ✅ Validate required fields
//     if (!name || !description || !price || !category) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     let imagePath = null;
//     if (req.file) {
//       imagePath = `/uploads/${req.file.filename}`;
//     }

//     const newPost = {
//       name,
//       description,
//       price,
//       category,
//       imagePath,
//       likes: [] // 👈 initialize empty likes array
//       // date will be automatically set by schema
//     };

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { $push: { posts: newPost } },
//       { new: true }
//     ).lean();

//     if (!updatedUser) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.status(200).json(updatedUser);
//   } catch (err) {
//     console.error("❌ Error in addPostToUser:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };


const addPostToUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, price, category } = req.body;

    // ✅ Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({ error: "All fields are required" });
    }

    let imagePath = null;

    // ✅ Upload to ImgBB instead of local storage
    if (req.file) {
      // Call the helper
      const url = await uploadToImgBB(req.file.path, req.file.originalname);
      console.log("🔥 ImgBB upload returned URL:", url);
      imagePath = url;

      // Optional: delete the local temp file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete local file:", err.message);
      });
    }

    const newPost = {
      name,
      description,
      price,
      category,
      imagePath,    // will be the ImgBB URL (or null)
      likes: [],    // initialize empty likes array
      // date auto-set by schema
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { posts: newPost } },
      { new: true }
    ).lean();

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("❌ Error in addPostToUser:", err);
    res.status(500).json({ error: "Server error" });
  }
};




// GET all posts from all users (with user info and sorted by newest)
const getAllPosts = async (req, res) => {
  const User = require("../models/User");

  try {
    const usersWithPosts = await User.find({}, "name profilePicture posts");

    const allPosts = [];

    usersWithPosts.forEach((user) => {
      user.posts.forEach((post) => {
        allPosts.push({
          _id: post._id,
          userName: user.name,
          userId: user._id,
          profilePicture: user.profilePicture,
          name: post.name,
          description: post.description,
          price: post.price,
          category: post.category,
          imagePath: post.imagePath,
          date: post.date,
          likes: post.likes // 👈 Add this line
        });
      });
    });

    // Sort by newest first
    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json(allPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




// Controller: Update a user's specific post
const updateUserPost = async (req, res) => {
  const { userId, postId } = req.params;
  const { name, description, price, category, imagePath } = req.body;
  // fields we might want to update

  // console.log("**updateUserPost called**");
  // console.log("userId:", userId);
  // console.log("postId:", postId);
  // console.log("req.body:", req.body);

  try {
    // Find the user by ID and the post by post ID
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find the specific post in user's posts array
    const post = user.posts.id(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Update the post's fields
    if (name !== undefined) post.name = name;
    if (description !== undefined) post.description = description;
    if (price !== undefined) post.price = price;
    if (category !== undefined) post.category = category;
    if (imagePath !== undefined) post.imagePath = imagePath;

    // Save the updated user document
    await user.save();

    res
      .status(200)
      .json({ message: "Post updated successfully", updatedPost: post });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// DELETE a specific post from the user's embedded posts
const deleteUserPost = async (req, res) => {
  try {
    const userId = req.user.id; // from authenticateToken middleware
    const postId = req.params.postId;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter out the post with the given postId
    const updatedPosts = user.posts.filter(post => post._id.toString() !== postId);

    // Check if the post actually existed
    if (updatedPosts.length === user.posts.length) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Update user's posts
    user.posts = updatedPosts;

    // Save the user
    await user.save();

    res.status(200).json({ message: "Post deleted successfully", posts: user.posts });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Something went wrong while deleting the post" });
  }
};








// for like a post
// POST /api/users/posts/:postId/like
const likePost = async (req, res) => {
  try {
    const userId = req.user.id;             // ID of the user who clicked “like”
    const { postId } = req.params;          // postId is the _id of the embedded post

    // 1️⃣ Find the liking user’s name & profilePicture
    const likingUser = await User.findById(userId, "name profilePicture");
    if (!likingUser) {
      return res.status(404).json({ error: "Liking user not found" });
    }

    // 2️⃣ Find the owner of that post (search posts._id)
    const postOwner = await User.findOne({ "posts._id": postId });
    if (!postOwner) {
      return res.status(404).json({ error: "Post owner not found" });
    }

    // 3️⃣ Grab the exact post sub-document
    const post = postOwner.posts.id(postId);

    // 4️⃣ See if this user has already liked it
    const alreadyLiked = post.likes.find(
      (like) => like.userId.toString() === userId
    );

    if (alreadyLiked) {
      // — If already liked, remove that entry (toggle off)
      post.likes = post.likes.filter(
        (like) => like.userId.toString() !== userId
      );
    } else {
      // — Otherwise, add a new like object
      post.likes.push({
        userId: userId,
        name: likingUser.name,
        profilePicture: likingUser.profilePicture,
      });
    }

    // 5️⃣ Save the change to the owner document
    await postOwner.save();

    res
      .status(200)
      .json({ message: alreadyLiked ? "Post unliked" : "Post liked" });
  } catch (err) {
    console.error("❌ Error in likePost:", err);
    res.status(500).json({ error: "Server error" });
  }
};








// extra codes

// GET: Fetch all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // 🧠 This finds all users in the DB
    res.status(200).json(users); // ✅ Send them back as JSON
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to fetch users" });
  }
};

module.exports = {
  insertUser,
  signInUser,
  getUserById,
  addPostToUser,
  getAllPosts,
  updateUserPost,
  deleteUserPost,
  likePost,
  getAllUsers,
};

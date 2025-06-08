const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadImage");
const uploadProfilePicture = require("../middlewares/uploadProfilePicture.js");

const {
  insertUser,
  signInUser,
  getUserById,
  addPostToUser,
  getAllPosts,
  updateUserPost,
  deleteUserPost,
  likePost,
  getPostById,


  getAllUsers

} = require("../controllers/userController");

const authenticateToken = require("../middlewares/authenticateToken");

// POST route to insert user
router.post("/insert", uploadProfilePicture.single("profilePicture"), insertUser);


// POST route to sign in
router.post("/signin", signInUser);



// Add post (image, description) to user
router.post(
  "/posts",
  authenticateToken,
  upload.single("image"), // Multer: “image” is the name of the file field
  addPostToUser
);


// ✅ GET all users' posts (used on home page)
router.get("/posts", getAllPosts);


// user can update thier posts on thier profle
router.put("/posts/:userId/:postId", authenticateToken, updateUserPost);


// DELETE a post by postId
router.delete("/delete-post/:postId", authenticateToken, deleteUserPost);


// for like a post
router.post("/posts/:postId/like", authenticateToken, likePost);



// get a specific post by id
router.get('/posts/:id', getPostById);















// extra routes

// GET a specific user's data
router.get("/:id", getUserById);

// GET route to fetch all users
router.get("/all", getAllUsers);

module.exports = router;

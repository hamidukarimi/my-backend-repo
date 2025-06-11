const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const Story = require("../models/Story");
const mongoose = require("mongoose");

const { createStory, getUserStories, getAllStories } = require("../controllers/storyController");

const authenticateToken = require("../middlewares/authenticateToken");

router.post("/create", authenticateToken, upload.single("image"), createStory);

// for showing stories
router.get("/", authenticateToken, getUserStories);

// show all stories
// 👥 Get all stories from all users
// ✅ Add this route to return all stories for all users
router.get("/all", authenticateToken, async (req, res) => {
  try {
    const stories = await Story.find().populate("user", "name lastName profilePicture");
    res.json(stories);
  } catch (error) {
    console.error("Error fetching all stories:", error);
    res.status(500).json({ message: "Server error while fetching all stories" });
  }
});

// Get a specific story by its ID

router.get("/:id", async (req, res) => {
  console.log("Fetching story with ID:", req.params.id); // ✅ Add this
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid story ID format" });
  }

  try {
    // const story = await Story.findById(id);
    const story = await Story.findById(req.params.id).populate("user", "name lastName profilePicture");
    if (!story) return res.status(404).json({ message: "Story not found" });
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});





module.exports = router;

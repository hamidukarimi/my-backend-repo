const fs = require("fs");
const uploadToImgBB = require("../utils/uploadToImgBB");
const Story = require("../models/Story"); // Replace with your real Story model

const createStory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    // ✅ Validate required field
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    let imagePath = null;

    // ✅ Upload image if it exists
    if (req.file) {
      const url = await uploadToImgBB(req.file.path, req.file.originalname);
      console.log("🔥 ImgBB upload returned URL:", url);
      imagePath = url;

      // Optional: delete temp file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete local file:", err.message);
      });
    }

    const newStory = new Story({
      user: userId, // link to user
      title,
      imagePath, // the ImgBB URL
      createdAt: new Date(),
    });

    await newStory.save();

    res.status(201).json({ message: "Story created", story: newStory });
  } catch (err) {
    console.error("❌ Error in createStory:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// for showing stories

const getUserStories = async (req, res) => {
  try {
    const userId = req.user.id;

    const stories = await Story.find({ user: userId })
      .populate("user", "name lastName profilePicture") // ✅ Populate user name
      .sort({ createdAt: -1 });

    res.status(200).json(stories);
  } catch (err) {
    console.error("❌ Error in getUserStories:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getAllStories = async (req, res) => {
  try {
    const stories = await Story.find()
      .sort({ date: -1 }) // latest first
      .populate("user", "name profilePicture");
    res.json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createStory, getUserStories, getAllStories };

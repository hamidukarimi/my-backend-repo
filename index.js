const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectToMongo = require("./config/mongoose");
const path = require("path");

dotenv.config();

const app = express();

// ✅ Fix CORS for Vite frontend (port 5173)
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

connectToMongo();

// Routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// after your `app.use(express.json())`, add:
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Basic route 
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

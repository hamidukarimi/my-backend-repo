const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectToMongo = require("./config/mongoose");
const path = require("path");

dotenv.config();

const app = express();

// ✅ Fix CORS for Vite frontend (port 5173)
const allowedOrigins = [
  "http://localhost:5173",
  "https://ecommerce-hamid.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));


app.use(express.json());

connectToMongo();

console.log("Running on:", process.env.NODE_ENV);
console.log("Server URL:", process.env.BASE_URL || "localhost");


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

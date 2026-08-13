const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skillswap";

  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected -> ${uri}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    console.error(
      "Make sure MongoDB is running locally, or that MONGO_URI in your .env points to a valid Atlas cluster."
    );
    process.exit(1);
  }
}

module.exports = connectDB;

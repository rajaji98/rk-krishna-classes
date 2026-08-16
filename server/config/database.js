const mongoose = require("mongoose");

async function connectDB() {

  try {

    console.log("Connecting to MongoDB...");

    await mongoose.connect(
      process.env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 10000
      }
    );

    console.log("✅ MongoDB Atlas Connected");

  } catch (error) {

    console.error(
      "❌ MongoDB connection failed:",
      error.message
    );

    process.exit(1);

  }

}

module.exports = connectDB;
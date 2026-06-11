const mongoose = require("mongoose");

async function connectDB() {

  try {

    console.log("Connecting...");

    await mongoose.connect(
      process.env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 10000
      }
    );

    console.log("✅ MongoDB Atlas Connected");

  } catch (error) {

    console.log("ERROR NAME:", error.name);
    console.log("ERROR MESSAGE:", error.message);
    console.log(error);

    process.exit(1);

  }

}

module.exports = connectDB;
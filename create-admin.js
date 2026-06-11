require("dotenv").config();

console.log(process.env.MONGODB_URI);

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Teacher = require("./server/models/Teacher");

async function createAdmin() {
  try {

    await mongoose.connect(process.env.MONGODB_URI);

    const existing =
      await Teacher.findOne({
        username: "teacher"
      });

    if (existing) {

      console.log("Admin already exists");
      process.exit(0);

    }

    const passwordHash =
      await bcrypt.hash(
        "RK@2026Secure",
        10
      );

    await Teacher.create({

      name: "Admin",

      username: "teacher",

      email: "0801me231019@sgsits.ac.in",

      mobile: "7999741662",

      role: "admin",

      passwordHash

    });

    console.log("✅ Admin created");

    process.exit(0);

  } catch (error) {

    console.error(error);
    process.exit(1);

  }
}

createAdmin();
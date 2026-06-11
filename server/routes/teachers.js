const express = require("express");
const bcrypt = require("bcryptjs");
const Teacher = require("../models/Teacher");
const { requireTeacher } = require("../middleware/auth");

const router = express.Router();

router.use(requireTeacher);

router.post("/", async (req, res) => {

  try {

      if (req.teacher.role !== "admin") {

    return res.status(403).json({
      message: "Only admin can create teachers."
    });

  }


    const existingTeacher =
      await Teacher.findOne({
        $or: [
          { username: req.body.username },
          { email: req.body.email }
        ]
      });

    if (existingTeacher) {

      return res.status(400).json({
        message: "Teacher already exists."
      });

    }

    const teacher =
      await Teacher.create({

        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        username: req.body.username,

        role: "teacher",

        passwordHash:
          await bcrypt.hash(
            req.body.password,
            10
          )

      });

    return res.json({
      message: "Teacher created",
      teacher
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Something went wrong."
    });

  }

});

module.exports = router;
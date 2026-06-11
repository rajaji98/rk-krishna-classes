const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { requireTeacher, getJwtSecret } = require("../middleware/auth");
const Teacher = require("../models/Teacher");
const sendEmail = require("../utils/sendEmail");


const router = express.Router();
const eightHours = 8 * 60 * 60 * 1000;

function publicTeacher(teacher) {
  return {
    id: teacher._id,
    name: teacher.name,
    username: teacher.username,
    email: teacher.email,
    mobile: teacher.mobile,
    role: teacher.role
  };
}

function setLoginCookie(res, token) {
  res.cookie("teacher_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: eightHours
  });
}


router.post("/login", async (req, res, next) => {
  try {

    const identifier = String(req.body.identifier || "")
      .trim()
      .toLowerCase();

    const password = String(req.body.password || "");

    if (!identifier || !password) {

      return res.status(400).json({
        message: "Username and password are required."
      });

    }

    const teacher = await Teacher.findOne({
      $or: [
        { username: identifier },
        { email: identifier },
        { mobile: identifier }
      ]
    });


    if (!teacher) {

      return res.status(401).json({
        message: "Invalid teacher login."
      });

    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        teacher.passwordHash
      );

    if (!passwordMatches) {

      return res.status(401).json({
        message: "Invalid teacher login."
      });

    }

    const token = jwt.sign(
      {
        sub: teacher._id,
        username: teacher.username,
        role: teacher.role
      },
      getJwtSecret(),
      {
        expiresIn: "8h"
      }
    );

    setLoginCookie(res, token);

    return res.json({
      teacher: publicTeacher(teacher)
    });

  } catch (error) {

    return next(error);

  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("teacher_token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return res.json({ message: "Logged out." });
});

router.get("/me", requireTeacher, (req, res) => {
  return res.json({ teacher: req.teacher });
});

router.get("/test-email", async (req, res) => {

  try {

    await sendEmail(

      process.env.EMAIL_USER,

      "RK Krishna Classes Test",

      `
      <h2>Email is working 🚀</h2>
      <p>This email was sent from RK Krishna Classes.</p>
      `

    );

    return res.json({
      message: "Email sent successfully"
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Email failed"
    });

  }

});

// forget password 
router.post(
  "/forgot-password",
  async (req, res) => {

    try {

      const email =
        String(req.body.email || "")
          .trim()
          .toLowerCase();

      const teacher =
        await Teacher.findOne({ email });

      if (!teacher) {

        return res.json({
          message:
            "If the email exists, a reset link has been sent."
        });

      }

      const token =
        crypto
          .randomBytes(32)
          .toString("hex");

      const hashedToken =
        crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");

      teacher.resetTokenExpires =
        Date.now() + 60 * 60 * 1000;

      await teacher.save();

      const resetUrl =
        `${process.env.FRONTEND_URL}/reset-password.html?token=${token}`;

      await sendEmail(

        teacher.email,

        "Reset Your Password",

        `
        <h2>RK Krishna Classes</h2>

        <p>
          Click below to reset your password:
        </p>

        <a href="${resetUrl}">
          Reset Password
        </a>

        <p>
          This link expires in 1 hour.
        </p>
        `

      );

      return res.json({
        message:
          "If the email exists, a reset link has been sent."
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          "Something went wrong."
      });
    }

  }
);

// Reset password
router.post(
  "/reset-password",
  async (req, res) => {

    try {

      const {
        token,
        password
      } = req.body;

      const teacher =
        await Teacher.findOne({

          resetToken: token,

          resetTokenExpires: {
            $gt: Date.now()
          }

        });

      if (!teacher) {

        return res.status(400).json({
          message:
            "Invalid or expired token."
        });

      }



teacher.passwordHash =
  await bcrypt.hash(
    password,
    10
  );


teacher.resetToken = undefined;
teacher.resetTokenExpires = undefined;

await teacher.save();

      return res.json({
        message:
          "Password updated successfully."
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          "Something went wrong."
      });

    }

  }
);



module.exports = router;
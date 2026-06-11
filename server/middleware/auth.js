const jwt = require("jsonwebtoken");
const Teacher = require("../models/Teacher");

function getJwtSecret() {
  return process.env.JWT_SECRET || "development-secret-change-this";
}

async function requireTeacher(req, res, next) {

  const cookieToken = req.cookies.teacher_token;

  const authHeader =
    req.headers.authorization || "";

  const bearerToken =
    authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

  const token =
    cookieToken || bearerToken;

  if (!token) {

    return res.status(401).json({
      message: "Please login as a teacher."
    });

  }

  try {

    const payload =
      jwt.verify(
        token,
        getJwtSecret()
      );

    const teacher =
      await Teacher.findById(
        payload.sub
      );

    if (!teacher) {

      return res.status(401).json({
        message:
          "Teacher account was not found."
      });

    }

    req.teacher = {

      id: teacher._id,

      username: teacher.username,
      name: teacher.name,
      email: teacher.email,
      mobile: teacher.mobile,

      role: teacher.role

    };

    return next();

  } catch (error) {

    return res.status(401).json({
      message:
        "Your login session has expired."
    });

  }

}

module.exports = {
  getJwtSecret,
  requireTeacher
};
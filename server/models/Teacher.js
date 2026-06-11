const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
{
  name: String,
  email: String,
  mobile: String,
  username: String,

  passwordHash: String,

  role: {
    type: String,
    default: "teacher"
  },

  resetToken: String,

  resetTokenExpires: Date

},
{
  timestamps: true
}
);

module.exports = mongoose.model("Teacher", teacherSchema);
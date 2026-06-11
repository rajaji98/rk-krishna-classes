const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    teacherId: String,
    teacherName: String,

    name: String,
    fatherName: String,

    dob: String,
    gender: String,

    address: String,
    phone: String,
    email: String,

    className: String, 

    schoolName: String,
    schoolTiming: String,
    lastExamPercentage: Number,

    subjects: [String],
    batch: String,

    joiningDate: String,
    dueDate: String,

    feeAmount: Number,
    amountPaid: Number,

    paymentStatus: String,
    photo: String,
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Student", studentSchema);
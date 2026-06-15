const express = require("express");
// const { randomUUID } = require("crypto");
const Student = require("../models/Student");
const { requireTeacher } = require("../middleware/auth");
// const { readJson, writeJson } = require("../utils/store");

const router = express.Router();
const paymentStatuses = new Set(["Paid", "Partial", "Due"]);

function cleanText(value) {
  return String(value || "").trim();
}

function cleanMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }

  return Math.round(amount * 100) / 100;
}

function cleanPaymentStatus(value) {
  const status = cleanText(value);
  return paymentStatuses.has(status) ? status : "Due";
}

function buildStudentPayload(
  body,
  existingStudent = {}
) {

    return {

      ...existingStudent,

      name:
        cleanText(
          body.name ??
          existingStudent.name
        ),

      fatherName:
        cleanText(
          body.fatherName ??
          existingStudent.fatherName
        ),

      phone:
        cleanText(
          body.phone ??
          existingStudent.phone
        ),

      email:
        cleanText(
          body.email ??
          existingStudent.email
        ),

      dob:
        cleanText(
          body.dob ??
          existingStudent.dob
        ),

      address:
        cleanText(
          body.address ??
          existingStudent.address
        ),

      className:
        cleanText(
          body.className ??
          existingStudent.className
        ),

      schoolName:
        cleanText(
          body.schoolName ??
          existingStudent.schoolName
        ),

      lastExamPercentage:
        Number(
          body.lastExamPercentage ??
          existingStudent.lastExamPercentage ??
          0
        ),

      subjects:
        body.subjects
          ? (
              Array.isArray(body.subjects)
                ? body.subjects
                : [body.subjects]
            )
          : body.subject
            ? [body.subject]
            : (
                existingStudent.subjects || []
              ),

      joiningDate:
        cleanText(
          body.joiningDate ??
          existingStudent.joiningDate
        ),

      paymentStatus:
        cleanPaymentStatus(
          body.paymentStatus ??
          existingStudent.paymentStatus
        ),

      feeAmount:
        cleanMoney(
          body.feeAmount ??
          existingStudent.feeAmount
        ),

      amountPaid:
        cleanMoney(
          body.amountPaid ??
          existingStudent.amountPaid
        ),

      dueDate:
        cleanText(
          body.dueDate ??
          existingStudent.dueDate
        ),

      notes:
        cleanText(
          body.notes ??
          existingStudent.notes
        )

    };

  }

function validateStudent(student) {
  if (!student.name) {
    return "Student name is required.";
  }

  if (
    !student.subjects ||
    student.subjects.length === 0
  ) {
    return "At least one subject is required.";
  }

  if (student.amountPaid > student.feeAmount && student.feeAmount > 0) {
    return "Amount paid cannot be greater than the total fee.";
  }

  return null;
}

function applyFilters(students, query) {
  const search = cleanText(query.search).toLowerCase();
  const paymentStatus = cleanText(query.paymentStatus);
  const subject = cleanText(query.subject).toLowerCase();

  return students.filter((student) => {
    const matchesSearch =
      !search ||
          [
            student.name,
            ...(student.subjects || []),
            student.phone,
            student.email
          ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));
    const matchesPayment = !paymentStatus || student.paymentStatus === paymentStatus;
    const matchesSubject =
        !subject ||
        (student.subjects || []).some(
          (s) => s.toLowerCase() === subject
        );

    return matchesSearch && matchesPayment && matchesSubject;
  });
}

function sortNewestFirst(students) {
  return [...students].sort((a, b) => {
    return String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt));
  });
}

router.use(requireTeacher);

router.get("/", async (req, res, next) => {
  try {

    let students;

    if (req.teacher.role === "admin") {

      students = await Student.find();

    } else {

      students = await Student.find({
        teacherId: req.teacher.id
      });

    }

    const filteredStudents =
      applyFilters(students, req.query);

    return res.json({
      students: sortNewestFirst(filteredStudents)
    });

  } catch (error) {

    return next(error);

  }
});

router.post("/", async (req, res, next) => {

  try {

    const newStudent = {

      teacherId: req.teacher.id,
      teacherName: req.teacher.username,

      ...buildStudentPayload(req.body)

    };

    const validationMessage =
      validateStudent(newStudent);

    if (validationMessage) {

      return res.status(400).json({
        message: validationMessage
      });

    }

    const student =
      await Student.create(newStudent);

    return res.status(201).json({
      student
    });

  } catch (error) {

    return next(error);

  }

});

router.get("/:id", async (req, res, next) => {

  try {

    let student;

    if (req.teacher.role === "admin") {

      student = await Student.findById(
        req.params.id
      );

    } else {

      student = await Student.findOne({
        _id: req.params.id,
        teacherId: req.teacher.id
      });

    }

    if (!student) {

      return res.status(404).json({
        message: "Student not found."
      });

    }

    return res.json({
      student
    });

  } catch (error) {

    return next(error);

  }

});

router.put("/:id", async (req, res, next) => {

  try {

    let student;

    if (req.teacher.role === "admin") {

      student = await Student.findById(
        req.params.id
      );

    } else {

      student = await Student.findOne({
        _id: req.params.id,
        teacherId: req.teacher.id
      });

    }

    if (!student) {

      return res.status(404).json({
        message: "Student was not found."
      });

    }

    Object.assign(
      student,
      buildStudentPayload(
        req.body,
        student
      )
    );

    const validationMessage =
      validateStudent(student);

    if (validationMessage) {

      return res.status(400).json({
        message: validationMessage
      });

    }

    await student.save();

    return res.json({
      student
    });

  } catch (error) {

    return next(error);

  }

});

router.delete("/:id", async (req, res, next) => {

  try {

    let deletedStudent;

    if (req.teacher.role === "admin") {

      deletedStudent =
        await Student.findByIdAndDelete(
          req.params.id
        );

    } else {

      deletedStudent =
        await Student.findOneAndDelete({
          _id: req.params.id,
          teacherId: req.teacher.id
        });

    }

    if (!deletedStudent) {

      return res.status(404).json({
        message: "Student was not found."
      });

    }

    return res.json({
      message: "Student deleted."
    });

  } catch (error) {

    return next(error);

  }

});

module.exports = router;
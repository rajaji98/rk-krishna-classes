const express = require("express");

const Student =
  require("../models/Student");

const upload =
  require("../middleware/upload");

const {
  requireTeacher
} =
  require("../middleware/auth");

const router =
  express.Router();

router.use(requireTeacher);

router.post(
  "/",
  upload.single("photo"),

  async (req, res) => {

    try {

      if (
        req.teacher.role !== "admin"
      ) {

        return res.status(403).json({
          message:
            "Only admin can create admissions."
        });

      }
      console.log("BODY:", req.body);
    console.log("SUBJECTS:", req.body.subjects);
    console.log("FILE:", req.file);

      const student =
        await Student.create({

          teacherId:
            req.teacher.id,

          teacherName:
            req.teacher.username,

          name:
            req.body.name,

          fatherName:
            req.body.fatherName,

          phone:
            req.body.phone,

          dob:
            req.body.dob,

          address:
            req.body.address,

          className:
            req.body.className,

          subjects:
            req.body.subjects,
        
          photo:
            req.file
                ? req.file.filename
                : null,
                
          schoolName:
            req.body.schoolName,

          lastExamPercentage:
            Number(
              req.body.lastExamPercentage || 0
            ),

          feeAmount:
            Number(
              req.body.feeAmount || 0
            ),

          amountPaid:
            Number(
              req.body.amountPaid || 0
            ),

          paymentStatus:
            req.body.paymentStatus ||

            "Due",

          joiningDate:
            new Date()
              .toISOString()

        });

        console.log(
  "Saved Student:",
  student
);


      return res.status(201).json({
        student
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
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");


// ===============================
// CLOUDINARY CONFIG
// ===============================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// ===============================
// MULTER MEMORY STORAGE
// ===============================

const storage = multer.memoryStorage();


// ===============================
// MULTER CONFIG
// ===============================

const multerUpload = multer({

  storage,

  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  },

  fileFilter: (req, file, cb) => {

    if (file.mimetype.startsWith("image/")) {

      cb(null, true);

    } else {

      cb(
        new Error("Only image files are allowed.")
      );

    }

  }

});


// ===============================
// CLOUDINARY UPLOAD MIDDLEWARE
// ===============================

function uploadToCloudinary(req, res, next) {

  if (!req.file) {

    return next();

  }

  const stream =
    cloudinary.uploader.upload_stream(

      {
        folder: "rk-krishna-classes/students",
        resource_type: "image"
      },

      (error, result) => {

        if (error) {

          console.error(
            "Cloudinary upload error:",
            error
          );

          return next(error);

        }

        // Store Cloudinary URL
        // in req.file.filename
        //
        // This allows your existing
        // student route to continue
        // using req.file.filename.

        req.file.filename =
          result.secure_url;

        req.file.cloudinaryUrl =
          result.secure_url;

        req.file.public_id =
          result.public_id;

        return next();

      }

    );

  stream.end(req.file.buffer);

}


// ===============================
// EXPORT
// ===============================

module.exports = {

  single: function (fieldName) {

    return function (req, res, next) {

      multerUpload.single(fieldName)(
        req,
        res,
        function (error) {

          if (error) {

            return next(error);

          }

          uploadToCloudinary(
            req,
            res,
            next
          );

        }
      );

    };

  }

};
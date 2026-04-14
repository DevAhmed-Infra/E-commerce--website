const multer = require('multer');
const AppError = require('../utils/appError');

//Disk Storage Engine  → returns a file
// const multerDistkStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './uploads/categories');
//   },
//   filename: function (req, file, cb) {
//     const ext = file.mimetype.split('/')[1];
//     const fileName = `category-${uuidv4()}-${Date.now()}.${ext}`;
//     cb(null, fileName);
//   }
// });
// const upload = multer({ storage: multerDistkStorage, fileFilter: multerFilter });

// Memory Storage → returns a buffer (sharp takes buffer files)

// const multerMemoryStorage = multer.memoryStorage();
//
// const multerFilter = function (req, file, cb) {
//   if (file.mimetype.startsWith('image')) {
//     cb(null, true);
//   } else {
//     cb(new AppError('Only image types are allowed', 400), false);
//   }
// };

const uploadSingleImage = (fieldName) => {
  const multerMemoryStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new AppError('Only image types are allowed', 400), false);
    }
  };

  const upload = multer({ storage: multerMemoryStorage, fileFilter: multerFilter });

  return upload.single(fieldName);
};

module.exports = {
  uploadSingleImage
};

const multer = require("multer");
const path = require("path");

// Cấu hình nơi lưu trữ file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Lưu ảnh vào thư mục 'uploads'
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // Đặt tên file tránh trùng lặp
  },
});

// Bộ lọc file (chỉ cho phép ảnh)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ hỗ trợ file ảnh (JPG, JPEG, PNG)"), false);
  }
};

// Giới hạn kích thước file (2MB)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

module.exports = upload;

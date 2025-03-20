const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const multer = require("multer");
const sendEmail = require("../controllers/emailController"); // Import sendEmail
const storage = multer.memoryStorage(); // Hoặc diskStorage nếu muốn lưu file vào server
const upload = multer({ storage });

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: "success",
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    },
  });
};

// Đăng ký
exports.signup = catchAsync(async (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      console.error("Lỗi upload file:", err);
      return next(new AppError("File upload failed", 500));
    }

    const { username, email, studentCode, password } = req.body;
    const avatar = req.file ? req.file.buffer : undefined;

    if (!username || !email || !password) {
      console.error("Thiếu trường bắt buộc:", { username, email, password });
      return next(new AppError("Missing required fields", 400));
    }

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email đã tồn tại. Vui lòng sử dụng email khác.",
      });
    }

    // Kiểm tra xem studentCode đã tồn tại chưa
    const existingStudentCode = await User.findOne({ studentCode });
    if (existingStudentCode) {
      return res.status(400).json({
        status: "error",
        message: "Mã sinh viên đã tồn tại. Vui lòng sử dụng mã sinh viên khác.",
      });
    }

    try {
      const newUser = await User.create({
        username,
        email,
        studentCode,
        password,
        avatar,
      });
      console.log("Người dùng đã được tạo:", newUser);

      // Gửi email thông báo đã kích hoạt tài khoản
      const subject = "Tài khoản của bạn đã được kích hoạt";
      const message = `Chào ${newUser.username},\n\nTài khoản của bạn đã được kích hoạt thành công. Bạn có thể đăng nhập vào hệ thống ngay bây giờ!`;

      await sendEmail(newUser.email, subject, message);

      // Gửi token cho người dùng
      createSendToken(newUser, 201, res);
    } catch (err) {
      console.error("Lỗi khi tạo người dùng:", err);
      return res.status(500).json({
        status: "error",
        message: "Something went wrong!",
      });
    }
  });
});

// Đăng nhập

exports.login = catchAsync(async (req, res, next) => {
  console.log("✅ Login API hit", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    console.log("❌ No user found with this email");
    return next(new AppError("Incorrect email or password", 401));
  }

  console.log("🔹 Hashed password in DB:", user.password);

  const isMatch = await user.correctPassword(password, user.password);
  console.log("🔹 Password Match Result:", isMatch);

  if (!isMatch) {
    return next(new AppError("Incorrect email or password", 401));
  }

  console.log("✅ Password matched! Generating token...");

  // Generate token
  const token = signToken(user._id);

  // Send only ONE response
  res.status(200).json({
    status: "success",
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    },
    redirectTo: user.role === "admin" ? "/dashboard" : "/",
  });
});

// Quên mật khẩu - Gửi email mật khẩu
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Vui lòng cung cấp email", 400));
  }

  // Tìm người dùng theo email
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("Không tìm thấy người dùng với email này", 404));
  }

  // Tạo mật khẩu tạm thời
  const tempPassword = Math.random().toString(36).slice(-8);

  // Cập nhật mật khẩu người dùng với mật khẩu tạm thời
  user.password = tempPassword;
  await user.save();

  try {
    // Gửi email chứa mật khẩu tạm thời của người dùng
    const subject = "Mật khẩu tạm thời của bạn";
    const message = `Chào ${user.username},\n\nMật khẩu tạm thời của bạn là: ${tempPassword}\n\nBạn có thể sử dụng mật khẩu này để đăng nhập vào tài khoản của mình.`;

    await sendEmail(user.email, subject, message);

    res.status(200).json({
      status: "success",
      message: "Mật khẩu tạm thời đã được gửi tới email của bạn!",
    });
  } catch (err) {
    console.error("Lỗi khi gửi email:", err);
    return next(new AppError("Không thể gửi email. Vui lòng thử lại sau!", 500));
  }
});

//hàm phân quyền
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Bạn chưa đăng nhập!', 401));
  }

  // Xác thực token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Tìm user từ database
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('Người dùng không tồn tại!', 401));
  }

  // Kiểm tra nếu user đã đổi mật khẩu sau khi token được phát hành
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('Mật khẩu đã thay đổi. Vui lòng đăng nhập lại!', 401)
    );
  }

  // Gán user vào request để sử dụng sau này
  req.user = currentUser;
  next();
});

// đổi mật khẩu
exports.changePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return next(new AppError('Vui lòng cung cấp đầy đủ thông tin', 400));
  }

  // Lấy user từ middleware `protect`
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new AppError('Không tìm thấy người dùng', 404));
  }

  // Kiểm tra mật khẩu cũ có đúng không
  const isMatch = await user.correctPassword(oldPassword, user.password);
  if (!isMatch) {
    return next(new AppError('Old password is incorrect', 401));
  }

  // Cập nhật mật khẩu mới
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Mật khẩu đã được thay đổi thành công!',
  });
});

//hàm logout
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Token hết hạn sau 10s
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Bạn đã đăng xuất!',
  });
};

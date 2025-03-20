const User = require("../models/userModel");
const Post = require("../models/postModel");
const Friendship = require("../models/friendshipModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const multer = require("multer");
const path = require("path");
const {
  factoryDeleteOne,
  factoryUpdateOne,
  factoryGetOne,
  factoryGetAll,
  factoryCreateOne,
} = require("./handlerFactory");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars/"); // Thư mục lưu ảnh
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Đặt tên file tránh trùng lặp
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Chỉ chấp nhận file ảnh!"), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // Giới hạn file 2MB
});

// CRUD
const filterObj = (obj, ...excluded) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (!excluded.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for password update!", 400));
  }
  const filterBody = filterObj(req.body, "isActive");
  if (req.file) filterBody.avatar = req.file.name;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    user: updatedUser,
  });
});
exports.getUserById = factoryGetOne(User);
exports.createNewUser = factoryCreateOne(User);
exports.getAllUsers = factoryGetAll(User);
exports.updateUser = factoryUpdateOne(User);
exports.deleteUser = factoryDeleteOne(User);
exports.getUserInfor = factoryGetOne(User, "moderatorCommunities bookmarks");
exports.getAllUsersPaginate = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status, email, username } = req.query;

  // Define filter criteria based on query parameters
  let filter = {};
  if (status) filter.status = status;
  if (email) filter.email = new RegExp(email, "i");
  if (username) filter.username = new RegExp(username, "i");

  // Apply filters and explicitly set the noIsActiveFilter flag to bypass isActive filtering
  const features = new APIFeatures(
    User.find(filter)
      .setOptions({ noIsActiveFilter: true }) // Disable isActive filtering
      .select("username email role studentCode isActive"),
    req.query
  )
    .sort()
    .paginate();

  // Execute the query for paginated users
  const users = await features.query;

  // Get the total number of matching documents
  const totalUsers = await User.countDocuments();

  // Get the count of active and inactive users
  const activeUsersCount = await User.countDocuments({
    isActive: true,
  });
  const inactiveUsersCount = await User.countDocuments({
    isActive: false,
  });

  // Send response
  res.status(200).json({
    results: users.length,
    total: totalUsers,
    activeUsersCount,
    inactiveUsersCount,
    totalPages: Math.ceil(totalUsers / limit),
    data: users,
  });
});
exports.toggleUserActiveStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find the user by ID, bypassing the `isActive` filter and selecting it explicitly
  const user = await User.findOne({ _id: id })
    .setOptions({ noIsActiveFilter: true })
    .select("+isActive");

  if (!user) {
    return next(new AppError(`No user found with ID ${id}`, 404));
  }

  // Toggle the `isActive` status
  user.isActive = !user.isActive;
  await user.save();

  // Response after successful update
  res.status(200).json({
    status: "success",
    message: `User status has been updated to ${
      user.isActive ? "active" : "inactive"
    }.`,
    data: {
      user,
    },
  });
});

exports.searchUsers = catchAsync(async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({
      status: "fail",
      message: "Query parameter is required for searching",
    });
  }
  console.log("Search Query:", query); // Debug query

  // Tìm kiếm theo displayName
  const searchFilter = { username: new RegExp(query, "i") };

  const users = await User.find(searchFilter)
    .select("username displayName email avatar") // Chỉ lấy các trường cần thiết
    .limit(10);

  res.status(200).json({
    status: "success",
    results: users.length,
    data: users,
  });
});

exports.searchUsers2 = catchAsync(async (req, res, next) => {
  const { keyword, userId } = req.query;

  if (!keyword || !userId) {
    return res.status(400).json({
      success: false,
      message: "Cần truyền keyword và userId trong query",
    });
  }

  // Tìm kiếm user theo từ khóa (tìm trong username hoặc displayName)
  const users = await User.find({
    $or: [
      { username: { $regex: keyword, $options: "i" } },
      { displayName: { $regex: keyword, $options: "i" } },
    ],
  }).select("_id username displayName avatar");

  // Lấy danh sách bạn bè của người dùng hiện tại (status accepted)
  const friendships = await Friendship.find({
    status: "accepted",
    $or: [{ requester: userId }, { recipient: userId }],
  });

  // Tạo mảng lưu các id của bạn bè
  const friendIds = friendships.map((fs) => {
    if (fs.requester.toString() === userId.toString()) {
      return fs.recipient.toString();
    } else {
      return fs.requester.toString();
    }
  });

  // Gắn thêm trường isFriend cho từng user trong kết quả tìm kiếm
  const results = users.map((user) => ({
    _id: user._id,
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar,
    isFriend: friendIds.includes(user._id.toString()),
  }));

  res.status(200).json({
    success: true,
    results: results.length,
    data: results,
  });
});

//Hàm lấy user profile\
exports.getUserProfile = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    // Kiểm tra xem req.user.id có hợp lệ không
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: "fail",
        message: "Không có quyền truy cập. Vui lòng đăng nhập lại!",
      });
    }

    // Tìm user trong database
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "Người dùng không tồn tại",
      });
    }

    // Chuyển đổi thành object thuần túy để có thể chỉnh sửa dữ liệu
    const userData = {
      ...user.toObject(),
      avatar: user.avatar || "https://example.com/default-avatar.png",
    };

    res.status(200).json({
      status: "success",
      message: "Lấy thông tin người dùng thành công",
      data: userData,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    res.status(500).json({
      status: "error",
      message: "Lỗi server, vui lòng thử lại sau!",
    });
  }
};


//Hàm Update user profile
exports.updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Vui lòng đăng nhập!" });
    }

    const { username, studentCode, avatar } = req.body; // Nhận URL ảnh từ frontend

    // Cập nhật thông tin người dùng trong database
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username, studentCode, avatar },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }

    res.status(200).json({
      status: "success",
      message: "Cập nhật thông tin thành công!",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Lỗi cập nhật hồ sơ:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

//Hàm lấy post
exports.getBookmarkedPosts = async (req, res) => {
  try {
    const userId = req.user.id; // ID của user lấy từ middleware auth

    // Lấy danh sách ID các bài post mà user đã bookmark
    const user = await User.findById(userId).select('bookmarks');
    
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Người dùng không tồn tại' });
    }

    // Truy vấn danh sách bài viết dựa trên ID đã bookmark
    const bookmarkedPosts = await Post.find({ _id: { $in: user.bookmarks || [] } });
    res.status(200).json({
      status: 'success',
      results: bookmarkedPosts.length,
      data: bookmarkedPosts,
    });
  } catch (error) {
    console.error('Lỗi server:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi server!' });
  }
};

// hàm update avatar


exports.updateAvatar = async (req, res) => {
  upload.single("avatar")(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({ status: "fail", message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ status: "fail", message: "Vui lòng chọn ảnh!" });
      }

      if (!req.user || !req.user.id) {
        return res.status(401).json({ status: "fail", message: "Không tìm thấy thông tin user!" });
      }

      // Cập nhật avatar cho user
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: `/uploads/avatars/${req.file.filename}` },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ status: "fail", message: "Không tìm thấy user!" });
      }

      res.status(200).json({
        status: "success",
        message: "Cập nhật avatar thành công!",
        avatar: user.avatar,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật avatar:", error);
      res.status(500).json({ status: "error", message: "Lỗi server!" });
    }
  });
};





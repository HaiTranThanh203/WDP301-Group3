const Community = require("../models/communityModel");
const Post = require("../models/postModel");
const Subscription = require("../models/subscriptionModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const subscriptionController = require("./subscriptionController");
const {
  factoryDeleteOne,
  factoryUpdateOne,
  factoryGetOne,
  factoryGetAll,
  factoryCreateOne,
} = require("./handlerFactory");

exports.searchCommunities = catchAsync(async (req, res, next) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({
      status: "fail",
      message: "Query parameter is required for searching",
    });
  }

  // Tìm kiếm theo name của community
  const searchFilter = { name: new RegExp(query, "i") };
 
  const communities = await Community.find(searchFilter)
    .select("name description logo memberCount") // Chỉ lấy các trường cần thiết
    .limit(100); // Giới hạn số lượng kết quả trả về

  res.status(200).json({
    status: "success",
    results: communities.length,
    data: communities,
  });
});

exports.factoryGetAll = (Model) => catchAsync(async (req, res, next) => {
  // Tìm tất cả bản ghi của mô hình và populate userId
  const docs = await Model.find()
    .populate('userId', 'name email') // Thêm populate vào đây, ví dụ lấy name và email từ user
    .exec();

  res.status(200).json({
    status: 'success',
    results: docs.length,
    data: docs,
  });
});
// CRUD
exports.getCommunityById = factoryGetOne(Community);
exports.createNewCommunity = factoryCreateOne(Community);
exports.getAllCommunities = catchAsync(async (req, res, next) => {
  const docs = await Community.find()
    .populate('createdBy', 'name email')  // Đảm bảo rằng trường này tồn tại và đúng
    .populate('moderators', 'name email') // Nếu có
    .exec();

  res.status(200).json({
    status: 'success',
    results: docs.length,
    data: docs,
  });
});

exports.updateCommunity = factoryUpdateOne(Community);
exports.deleteCommunity = factoryDeleteOne(Community);
exports.addUserById = subscriptionController.createNewSubscription;
//tạo các join requests cho community
exports.addRequest = catchAsync(async (req, res, next) => {
  const update = {
    $addToSet: { joinRequests: { $each: req.body.joinRequests } },
  }; // Thay "arrayField" bằng tên trường mảng thực tế

  const doc = await Community.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });

  if (!doc) {
    return next(
      new AppError(`No document found with ID ${req.params.id}`, 404)
    );
  }

  res.status(200).json(doc);
});
//lay cac bai post trong community
exports.getPostInCommunity = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log("community id", id);
    const posts = await Post.find({
      communityId: new mongoose.Types.ObjectId(id),
    }).exec();

    if (posts) {
      res.status(200).json(posts);
      console.log("Post found", posts);
    } else {
      res.status(404).json({ message: "No posts found for this community" });
    }
  } catch (error) {
    next(error);
  }
};
exports.accessRequest = async (req, res, next) => {
  try {
    const id = req.params.id;
    const rIds = req.body.ids; // Giả sử rIds là một mảng chứa các _id của joinRequests cần xử lý

    const community = await Community.findById(id);

    if (community) {
      const subs = community.joinRequests
        .filter((item) => rIds.includes(item._id.toString())) // Chỉ chọn các yêu cầu có _id nằm trong mảng rIds
        .map((item) => ({
          userId: item.userId,
          access: true,
          communityId: id,
          role: "member",
        }));

      if (subs.length > 0) {
        // Tạo nhiều Subscription cùng lúc
        const newSubs = await Subscription.insertMany(subs);

        // Sử dụng $pull để xóa các joinRequest đã xử lý khỏi community
        await Community.findByIdAndUpdate(id, {
          $pull: { joinRequests: { _id: { $in: rIds } } }, // Loại bỏ các joinRequests có _id nằm trong mảng rIds
        });

        // Trả về kết quả
        res.status(201).json(newSubs);
      } else {
        res
          .status(404)
          .json({ message: "No valid requests found or access not allowed" });
      }
    } else {
      res.status(404).json({ message: "Community not found" });
    }
  } catch (error) {
    next(error);
  }
};
exports.getUserInCommunity = async (req, res, next) => {
  try {
    const userId = req.params.id;
    console.log("📌 Received User ID:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`❌ Invalid User ID: ${userId}`);
      return res.status(400).json({ success: false, message: "Invalid User ID" });
    }

    // ✅ Fetch subscriptions where the user has access to a community
    const userCommunities = await Subscription.find({ userId, access: true })
      .populate("communityId", "name description");

    if (!userCommunities.length) {
      return res.status(404).json({ success: false, message: "User has not joined any communities" });
    }

    // Extract the communities from subscriptions
    const communities = userCommunities.map(sub => sub.communityId);

    res.status(200).json({ success: true, data: communities });

  } catch (error) {
    console.error("❌ Server error fetching user communities:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.deleteUserFromCommunity = async (req, res, next) => {
  try {
    const cId = req.body.communityId;
    const uid = req.body.userId;

    // Cập nhật các trường cần thiết về null
    await Subscription.updateMany(
      { userId: uid, communityId: cId },
      { $set: { userId: null, communityId: null } }
    );

    res.status(204).json({
      message: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

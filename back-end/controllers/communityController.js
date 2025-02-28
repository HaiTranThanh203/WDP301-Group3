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
      status: 'fail',
      message: 'Query parameter is required for searching',
    });
  }

  // Tìm kiếm theo name của community
  const searchFilter = { name: new RegExp(query, 'i') };

  const communities = await Community.find(searchFilter)
    .select('name description logo memberCount') // Chỉ lấy các trường cần thiết
    .limit(100); // Giới hạn số lượng kết quả trả về

  res.status(200).json({
    status: 'success',
    results: communities.length,
    data: communities,
  });
});

// CRUD
exports.getCommunityById = factoryGetOne(Community);
exports.createNewCommunity = factoryCreateOne(Community);
exports.getAllCommunities = factoryGetAll(Community);
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

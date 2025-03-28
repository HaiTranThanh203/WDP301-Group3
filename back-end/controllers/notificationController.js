const Notification = require("../models/notificationModel");
const catchAsync = require("../utils/catchAsync");
const {
  factoryUpdateOne,
  factoryDeleteOne,
  factoryCreateOne,
} = require("./handlerFactory");

// CRUD
exports.getMyNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ userId: req.body.id })
    .sort({ createAt: -1 })
    .limit(20)
    .lean();
  res.status(200).json(notifications);
});
exports.createNewNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.create(req.body);
  res.status(200).json(notification);
});
exports.updateNotification = factoryUpdateOne(Notification);
exports.deleteNotification = factoryDeleteOne(Notification);

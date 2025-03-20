const Message = require('../models/messageModel');
const catchAsync = require('../utils/catchAsync'); // Hàm wrapper xử lý async, error
const APIFeatures = require('../utils/apiFeatures'); // Class hỗ trợ lọc, sắp xếp, phân trang,...
const { getIo } = require('../socket');

// Controller gửi tin nhắn
// Controller gửi tin nhắn
exports.sendMessage = catchAsync(async (req, res, next) => {
  const { sender, recipient, content } = req.body;

  // Create and save the message in the database
  const message = await Message.create({ sender, recipient, content });

  // Get socket.io instance
  const io = getIo();
  console.log(`Emitting newMessage to rooms: ${sender} and ${recipient}`);
  io.to(recipient).emit('newMessage', message);
  io.to(sender).emit('newMessage', message);

  res.status(201).json({
    success: true,
    data: message,
  });
});

// Controller lấy tin nhắn với phân trang
exports.getMessages = catchAsync(async (req, res, next) => {
  // Lấy sender và recipient từ query string
  const { sender, recipient } = req.query;

  if (!sender || !recipient) {
    return res.status(400).json({
      success: false,
      message: 'Cần truyền đầy đủ sender và recipient để lấy tin nhắn giữa 2 người'
    });
  }

  // Bộ lọc lấy tin nhắn giữa 2 người (dù gửi theo chiều nào)
  const filter = {
    $or: [
      { sender: sender, recipient: recipient },
      { sender: recipient, recipient: sender }
    ]
  };

  // Thiết lập phân trang
  const limit = req.query.limit ? parseInt(req.query.limit) : 15;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const skip = (page - 1) * limit;

  // Đếm tổng số tin nhắn phù hợp với filter
  const totalMessages = await Message.countDocuments(filter);

  // Lấy tin nhắn với sắp xếp theo createdAt (nếu cần), bỏ qua (skip) và giới hạn (limit)
  const messages = await Message.find(filter)
    .sort({ createdAt: 1 }) // Sắp xếp theo thời gian tăng dần, thay đổi nếu cần
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    results: messages.length,
    total: totalMessages,
    totalPages: Math.ceil(totalMessages / limit),
    data: messages
  });
});

// Hàm đánh dấu tin nhắn đã đọc
exports.markMessagesAsRead = catchAsync(async (req, res, next) => {
  // Giả sử client gửi sender và recipient để xác định cuộc trò chuyện
  const { sender, recipient } = req.body;
  
  if (!sender || !recipient) {
    return res.status(400).json({
      success: false,
      message: 'Cần truyền sender và recipient'
    });
  }
  
  // Cập nhật tất cả tin nhắn từ sender đến recipient mà chưa được đọc
  const result = await Message.updateMany(
    { sender: sender, recipient: recipient, isRead: false },
    { isRead: true }
  );
  
  // (Tùy chọn) Phát sự kiện qua socket cho người gửi để thông báo tin nhắn đã đọc
  const io = getIo();
  io.to(sender).emit('messagesRead', { recipient, updatedCount: result.nModified });
  
  res.status(200).json({
    success: true,
    updatedCount: result.nModified
  });
});
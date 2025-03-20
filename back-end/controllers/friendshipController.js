const Friendship = require('../models/friendshipModel');
const catchAsync = require('../utils/catchAsync');

/**
 * Hàm lấy danh sách bạn bè của một user dựa vào mối quan hệ đã được chấp nhận.
 * Client gọi: GET /api/friendships/friends?userId=<USER_ID>
 */
exports.getFriends = catchAsync(async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng truyền userId qua query'
    });
  }

  // Tìm các mối quan hệ kết bạn đã được chấp nhận mà user là requester hoặc recipient
  const friendships = await Friendship.find({
    status: 'accepted',
    $or: [{ requester: userId }, { recipient: userId }]
  })
    .populate('requester', 'username displayName avatar')
    .populate('recipient', 'username displayName avatar');

  // Xác định bạn bè (với mỗi mối quan hệ, bên nào không phải userId là bạn)
  const friends = friendships.map(friendship => {
    if (friendship.requester._id.toString() === userId.toString()) {
      return friendship.recipient;
    } else {
      return friendship.requester;
    }
  });

  res.status(200).json({
    success: true,
    results: friends.length,
    data: friends
  });
});

// **
//  * Hàm gửi lời mời kết bạn.
//  * - Nếu không có mối quan hệ nào, tạo mới với status 'pending'
//  * - Nếu đã tồn tại:
//  *    + Nếu status là 'pending' => thông báo lời mời đang chờ duyệt
//  *    + Nếu status là 'accepted' => báo lỗi đã là bạn bè
//  *    + Nếu status là 'rejected' => báo lỗi, không cho gửi lại lời mời
//  *
//  * Client gọi: POST /api/friendships/add
//  * Body JSON: { "requester": "USER_ID_1", "recipient": "USER_ID_2" }
//  */
exports.addFriend = catchAsync(async (req, res, next) => {
  const { requester, recipient } = req.body;

  if (!requester || !recipient) {
    return res.status(400).json({
      success: false,
      message: 'Cần truyền requester và recipient'
    });
  }
  if (requester === recipient) {
    return res.status(400).json({
      success: false,
      message: 'requester và recipient giống nhau không hợp lệ.'
    });
  }

  // Kiểm tra xem đã tồn tại mối quan hệ nào giữa 2 người chưa
  let friendship = await Friendship.findOne({
    $or: [
      { requester, recipient },
      { requester: recipient, recipient: requester }
    ]
  });

  if (friendship) {
    if (friendship.status === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Lời mời kết bạn đang chờ duyệt.'
      });
    }
    if (friendship.status === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Hai người đã là bạn bè rồi.'
      });
    }
    if (friendship.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Lời mời kết bạn đã bị từ chối. Không thể gửi lại lời mời.'
      });
    }
  } else {
    // Chưa có mối quan hệ nào, tạo mới lời mời với status 'pending'
    const newFriendship = await Friendship.create({ requester, recipient, status: 'pending' });
    return res.status(201).json({
      success: true,
      message: 'Lời mời kết bạn đã được gửi.',
      data: newFriendship
    });
  }
});

/**
 * Hàm chấp nhận lời mời kết bạn.
 * - Chỉ cho phép người nhận (recipient) chấp nhận lời mời từ người gửi (requester) nếu trạng thái đang là pending.
 *
 * Client gọi: POST /api/friendships/accept
 * Body JSON: { "requester": "USER_ID_1", "recipient": "USER_ID_2" }
 */
exports.acceptFriendRequest = catchAsync(async (req, res, next) => {
  const { requester, recipient } = req.body;

  if (!requester || !recipient) {
    return res.status(400).json({
      success: false,
      message: 'Cần truyền requester và recipient'
    });
  }
  if (requester === recipient) {
    return res.status(400).json({
      success: false,
      message: 'requester và recipient giống nhau không hợp lệ.'
    });
  }
  // Tìm lời mời kết bạn mà người nhận phải chấp nhận
  const friendship = await Friendship.findOne({
    requester,
    recipient,
    status: 'pending'
  });

  if (!friendship) {
    return res.status(400).json({
      success: false,
      message: 'Không tìm thấy lời mời kết bạn hợp lệ.'
    });
  }

  friendship.status = 'accepted';
  await friendship.save();
  
  const pendingCount = await Friendship.countDocuments({
    recipient,
    status: 'pending'
  });
  res.status(200).json({
    success: true,
    message: 'Lời mời kết bạn đã được chấp nhận.',
    data: friendship,
    pendingCount
  });
});

/**
 * Hàm từ chối lời mời kết bạn.
 * - Người nhận (recipient) từ chối lời mời nếu trạng thái là pending.
 *
 * Client gọi: POST /api/friendships/reject
 * Body JSON: { "requester": "USER_ID_1", "recipient": "USER_ID_2" }
 */
exports.rejectFriendRequest = catchAsync(async (req, res, next) => {
  const { requester, recipient } = req.body;

  if (!requester || !recipient) {
    return res.status(400).json({
      success: false,
      message: 'Cần truyền requester và recipient'
    });
  }

  // Tìm lời mời kết bạn pending
  const friendship = await Friendship.findOne({
    requester,
    recipient,
    status: 'pending'
  });

  if (!friendship) {
    return res.status(400).json({
      success: false,
      message: 'Không tìm thấy lời mời kết bạn hợp lệ.'
    });
  }

  friendship.status = 'rejected';
  await friendship.save();
  const pendingCount = await Friendship.countDocuments({
    recipient,
    status: 'pending'
  });

  res.status(200).json({
    success: true,
    message: 'Lời mời kết bạn đã bị từ chối.',
    data: friendship,
    pendingCount
  });
});

/**
 * Hàm hủy kết bạn (unfriend)
 * Client gọi: POST /api/friendships/unfriend
 * Body JSON: { userId1: "USER_ID_1", userId2: "USER_ID_2" }
 */
exports.unfriend = catchAsync(async (req, res, next) => {
  const { userId1, userId2 } = req.body;

  if (!userId1 || !userId2) {
    return res.status(400).json({
      success: false,
      message: 'Cần truyền userId1 và userId2'
    });
  }

  // Tìm mối quan hệ đã được chấp nhận giữa 2 người và xóa nó
  const friendship = await Friendship.findOneAndDelete({
    status: 'accepted',
    $or: [
      { requester: userId1, recipient: userId2 },
      { requester: userId2, recipient: userId1 }
    ]
  });

  if (!friendship) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy mối quan hệ bạn bè.'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Hủy kết bạn thành công.'
  });
});
exports.getUserFriendships = catchAsync(async (req, res, next) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'Cần truyền userId trong query'
    });
  }
  
  // Tìm tất cả mối quan hệ mà user là requester hoặc recipient
  const friendships = await Friendship.find({
     recipient: userId 
  })
    .populate('requester', 'username displayName avatar')
    .populate('recipient', 'username displayName avatar');
  
  // Lọc bỏ những mối quan hệ có dữ liệu null (do user bị xóa hoặc không tồn tại)
  const validFriendships = friendships.filter(fs => fs.requester && fs.recipient);
  
  // Với mỗi mối quan hệ, xác định "bạn" (người bên kia) và gán trạng thái
  const results = validFriendships.map(fs => {
    const friend = fs.requester._id.toString() === userId.toString() ? fs.recipient : fs.requester;
    return {
      friendshipId: fs._id,
      friend,      // Trả về đối tượng friend đã được xác định
      status: fs.status,
      createdAt: fs.createdAt
    };
  });
  
  // Tách riêng kết quả theo trạng thái
  const accepted = results.filter(r => r.status === 'accepted');
  const pending = results.filter(r => r.status === 'pending');
  
  res.status(200).json({
    success: true,
    acceptedCount: accepted.length,
    pendingCount: pending.length,
    accepted,
    pending
  });
});

//hàm đếm có bao nhiêu lời mời kết bạn
exports.hasPendingFriendRequests = catchAsync(async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'Cần truyền userId trong query'
    });
  }

  // Đếm số lượng lời mời kết bạn đang chờ
  const pendingCount = await Friendship.countDocuments({
    recipient: userId,
    status: 'pending'
  });

  res.status(200).json({
    success: true,
    notificationCount: pendingCount
  });
});


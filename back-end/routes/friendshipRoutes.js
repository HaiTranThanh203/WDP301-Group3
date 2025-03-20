const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendshipController');

// Lấy danh sách bạn bè: GET /api/friendships/friends?userId=<USER_ID>
router.get('/friends', friendshipController.getFriends);

// Gửi lời mời kết bạn (hoặc tự động chấp nhận nếu có lời mời ngược lại):
// POST /api/friendships/add
// Body: { "requester": "USER_ID_1", "recipient": "USER_ID_2" }
router.post('/add', friendshipController.addFriend);

// Chấp nhận lời mời kết bạn: POST /api/friendships/accept
router.post('/accept', friendshipController.acceptFriendRequest);

// Từ chối lời mời kết bạn: POST /api/friendships/reject
router.post('/reject', friendshipController.rejectFriendRequest);
// Hủy kết bạn:
// POST /api/friendships/unfriend
// Body: { "userId1": "USER_ID_1", "userId2": "USER_ID_2" }
router.post('/unfriend', friendshipController.unfriend);
// Lấy danh sách bạn bè và trạng thái của các mối quan hệ của user
// Ví dụ: GET http://localhost:9999/api/friendships/status?userId=<USER_ID>
router.get('/status', friendshipController.getUserFriendships);

router.get('/has-pending-requests', friendshipController.hasPendingFriendRequests);
// router.post("/handle-friend-request", friendshipController.handleFriendRequest);

module.exports = router;

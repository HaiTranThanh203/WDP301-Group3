import axios from 'axios';
import { message } from 'antd';

export const BASE_URL = 'http://localhost:9999/api/v1';

// Hàm trả về header chung
export const getCommonHeader = () => {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
  };
};

// Lấy danh sách bạn bè của user
export const getFriends = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/friendships/friends`, {
      headers: getCommonHeader(),
      params: { userId },
    });
    return response.data;
  } catch (error) {
    message.error('Lỗi khi lấy danh sách bạn bè: ' + error.message);
    throw error;
  }
};

// Gửi lời mời kết bạn
export const addFriend = async (requester, recipient) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/friendships/add`,
      { requester, recipient },
      { headers: getCommonHeader() }
    );
    return response.data;
  } catch (error) {
    message.error('Lỗi khi gửi lời mời kết bạn: ' + error.message);
    throw error;
  }
};

// Chấp nhận lời mời kết bạn
export const acceptFriendRequest = async (requester, recipient) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/friendships/accept`,
      { requester, recipient },
      { headers: getCommonHeader() }
    );
    return response.data;
  } catch (error) {
    message.error('Lỗi khi chấp nhận lời mời kết bạn: ' + error.message);
    throw error;
  }
};

// Từ chối lời mời kết bạn
export const rejectFriendRequest = async (requester, recipient) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/friendships/reject`,
      { requester, recipient },
      { headers: getCommonHeader() }
    );
    return response.data;
  } catch (error) {
    message.error('Lỗi khi từ chối lời mời kết bạn: ' + error.message);
    throw error;
  }
};

// Hủy kết bạn (unfriend)
export const unfriend = async (userId1, userId2) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/friendships/unfriend`,
      { userId1, userId2 },
      { headers: getCommonHeader() }
    );
    return response.data;
  } catch (error) {
    message.error('Lỗi khi hủy kết bạn: ' + error.message);
    throw error;
  }
};

// Lấy danh sách mối quan hệ của user với trạng thái (accepted, pending)
export const getUserFriendships = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/friendships/status`, {
      headers: getCommonHeader(),
      params: { userId },
    });
    return response.data;
  } catch (error) {
    message.error('Lỗi khi lấy thông tin mối quan hệ: ' + error.message);
    throw error;
  }
};

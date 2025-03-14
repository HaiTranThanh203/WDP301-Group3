import axios from 'axios';


export const BASE_URL = 'http://localhost:9999/api/v1';

// Hàm trả về header chung
export const getCommonHeader = () => {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: 'Bearer ' + localStorage.getItem('token'),
  };
};

// Gửi tin nhắn
export const sendMessage = async (sender, recipient, content) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/messages`,
      { sender, recipient, content },
      { headers: getCommonHeader() }
    );
    
    return response.data;
  } catch (error) {
  
    throw error;
  }
};

// Lấy danh sách tin nhắn giữa 2 người (có phân trang)
export const getMessages = async (sender, recipient, limit = 20, page = 1) => {
  try {
    const response = await axios.get(`${BASE_URL}/messages`, {
      headers: getCommonHeader(),
      params: { sender, recipient, limit, page },
    });
    return response.data;
  } catch (error) {
   
    throw error;
  }
};

// Đánh dấu tin nhắn đã đọc
export const markMessagesAsRead = async (sender, recipient) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/messages/mark-as-read`,
      { sender, recipient },
      { headers: getCommonHeader() }
    );
 
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

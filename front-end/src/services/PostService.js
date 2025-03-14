import axios from "axios";
import { message } from "antd";
import { BASE_URL, getHeader } from "./api";
export const doVotePost = async (postId, vote) => {
  try {
    const res = await axios.patch(
      `${BASE_URL}/posts/vote/${postId}`,
      { vote: vote },
      {
        headers: getHeader(),
      }
    );
    return res.data;
  } catch (error) {
    message.error("Error vote comment: " + error?.message);
    throw error;
  }
};

export const doGetAllPost = async () => {
  try {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "http://localhost:9999/api/v1/posts/",
      headers: getHeader(),
    };

    const response = await axios.request(config); // Chờ kết quả từ API
    return response.data; // Trả về dữ liệu để sử dụng trong component
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài viết:", error);
    return []; // Trả về một mảng rỗng nếu lỗi để tránh crash UI
  }
};

export const doGetPostDetail = async (postId) => {
  try {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `http://localhost:9999/api/v1/posts/${postId}`, // Sử dụng postId động
      headers: getHeader(),
    };

    const response = await axios.request(config); // Đợi phản hồi từ server
    return response.data; // Trả về dữ liệu để component sử dụng
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết bài viết:", error);
    message.error("Lỗi khi lấy chi tiết bài viết: " + error?.message);
    throw error;
  }
};

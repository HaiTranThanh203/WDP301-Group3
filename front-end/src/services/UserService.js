import axios from "axios";
import { message } from "antd";
import { BASE_URL, getHeader } from "./api";

export const doGetUserById = async (userId) => {
  try {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `http://localhost:9999/api/v1/users/${userId}`, // Truyền userId động
      headers: {},
    };

    const response = await axios.request(config); // Đợi dữ liệu từ API
    return response.data; // Trả về dữ liệu để component sử dụng
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    throw error;
  }
};



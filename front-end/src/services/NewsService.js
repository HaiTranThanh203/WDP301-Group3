// front-end/src/services/NewsService.js

import axios from 'axios';
import { message } from 'antd';

export const BASE_URL = 'http://localhost:9999/api/v1/news';

// Hàm trả về header chung
const getCommonHeader = () => {
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
      "Authorization": "Bearer " + localStorage.getItem("token"),
    };
  };
  
  export default getCommonHeader;
  

// Function to toggle user status by ID
// export const toggleUserStatus = async (userId) => {
//   try {
//     const response = await axios.patch(
//       `${BASE_URL}/users/${userId}/toggle-active`,
//       {}, // Body (nếu có) có thể là {} nếu không cần dữ liệu
//       { headers: getCommonHeader() }
//     );
//     return response.data;
//   } catch (error) {
//     message.error('Error updating user status: ' + error.message);
//     throw error;
//   }
// };

// Function to fetch list of users with filters (pagination, search)
export const getListNews = async (page = 1, limit = 5, isActive, title = "") => {
  try {
    const params = { page, limit, title };
    // Chỉ thêm isActive vào params nếu là boolean (tức không phải "All")
    if (typeof isActive === "boolean") {
      params.isActive = isActive;
    }
    const response = await axios.get(`${BASE_URL}/list`, {
      headers: getCommonHeader(),
      params,
    });
    return response.data; // Giả sử API trả về đối tượng: { results, total, totalPages, activeNewsCount, inactiveNewsCount, data: [...] }
  } catch (error) {
    message.error("Error fetching news: " + error.message);
    throw error;
  }
};

// Function to get user details by ID
export const getDetailNewsById = async (id) => {
  try {
    const endpoint = `${BASE_URL}/${id}`;
    const response = await axios.get(endpoint, {
      headers: getCommonHeader(),
    });
    return response.data;
  } catch (error) {
    message.error('Error fetching user details: ' + error.message);
    throw error;
  }
};

export const createNews = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/list`, data, {
      headers: getCommonHeader(),
    });
    return response.data;
  }
  catch (error) {
    message.error('Error creating news: ' + error.message);
    throw error;
  }
}
 export const updateNews = async (id, data) => {
    try {
        const endpoint = `${BASE_URL}/${id}`;
        const response = await axios.patch(endpoint, data, {
            headers: getCommonHeader(),
        });
        return response.data;   
    }
    catch (error) {
        message.error('Error updating news: ' + error.message);
        throw error;

    }
}
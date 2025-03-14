

import axios from 'axios';
import { message } from 'antd';
import { api,BASE_URL} from "./api";

export async function searchCommunities(query) {
    try {
        const endpoint = `http://localhost:9999/api/v1/communities/search?query=${query}`;
        const response = await api.get(endpoint);  // Không dùng params
        return response.data;
    } catch (error) {
        console.error("Error searching communities:", error);
        throw error;
    }
}

export async function searchUsers(query) {
    try {
        const endpoint = `http://localhost:9999/api/v1/users/search?query=${query}`;
        const response = await api.get(endpoint);  // Không dùng params
        return response.data;
    } catch (error) {
        console.error("Error searching users:", error);
        throw error;
    }
}



export async function searchByFilter(query, filter) {
  try {
    let endpoint = "";

    if (filter === "Community") {
      endpoint = `http://localhost:9999/api/v1/communities/search?query=${query}`;
    } else if (filter === "Friends") {
      endpoint = `http://localhost:9999/api/v1/users/search?query=${query}`;
    }

    if (!endpoint) return null;

    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error searching:", error);
    return null;
  }
}

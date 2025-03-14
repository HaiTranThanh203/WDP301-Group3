import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaPlusCircle } from "react-icons/fa";
import axios from "axios";

const API_URL = "http://localhost:9999/api/v1/users/community-join";

const SearchByCommunity = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchResults = location.state?.results || []; // Lấy danh sách từ Header

  const [groups, setGroups] = useState([]);
  const [joinStatus, setJoinStatus] = useState([]);

  // Lấy userId từ localStorage
  const storedUser = localStorage.getItem("user");
  const userId = storedUser ? JSON.parse(storedUser).id : null;

  useEffect(() => {
    setGroups(searchResults);
    if (userId) fetchJoinStatus(); // Chỉ gọi API nếu userId tồn tại
  }, [searchResults, userId]);

  // 🛠 Gọi API kiểm tra trạng thái join
  const fetchJoinStatus = async () => {
    try {
      const response = await axios.get(API_URL);
      setJoinStatus(response.data); // Lưu trạng thái từ API
    } catch (error) {
      console.error("Error fetching join status:", error);
    }
  };

  // 🛠 Kiểm tra nhóm nào user đã tham gia
  const checkIfJoined = (groupId) => {
    return joinStatus.some(
      (entry) =>
        entry.userId?._id === userId && entry.communityId?._id === groupId
    );
  };

  // 🛠 Khi click vào hàng, điều hướng đến trang chi tiết của nhóm
  const handleRowClick = (groupId) => {
    navigate(`/viewcommunity/${groupId}`);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl mx-auto w-full border border-gray-200">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-indigo-500 pb-2">
        Community Search Results
      </h2>
      {groups.length > 0 ? (
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-indigo-50 text-indigo-700 text-left text-sm font-semibold uppercase tracking-wider">
              <th className="py-4 px-6">Avatar</th>
              <th className="py-4 px-6">Name</th>
              <th className="py-4 px-6">Members</th>
              <th className="py-4 px-6">Description</th>
              <th className="py-4 px-6 ">Status</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group, index) => {
              const isJoined = checkIfJoined(group.id);

              return (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleRowClick(group.id)}
                >
                  <td className="py-6 px-6">
                    <img
                      src={group.image || "default.jpg"}
                      alt={group.name}
                      className="h-16 w-16 rounded-full object-cover border-2 border-indigo-200 hover:scale-105 transition-transform duration-300"
                    />
                  </td>
                  <td className="py-6 px-6">
                    <span className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-200">
                      {group.name}
                    </span>
                  </td>
                  <td className="py-6 px-6">
                    <p className="text-md text-gray-600">
                      {group.memberCount} members
                    </p>
                  </td>
                  <td className="py-6 px-6">
                    <p className="text-md text-gray-600">{group.description}</p>
                  </td>
                  <td className="py-6 px-6 text-right">
                    <button
                      disabled // ✅ Vô hiệu hóa nút
                      className={`flex items-center justify-center space-x-2 px-6 py-3 text-md font-semibold rounded-full transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isJoined
                          ? "bg-green-500 focus:ring-green-300"
                          : "bg-gradient-to-r from-blue-500 to-indigo-500 focus:ring-blue-300"
                      } text-white shadow-md `} // ✅ Thêm class `cursor-not-allowed` để báo hiệu không thể nhấn
                    >
                      {isJoined ? (
                        <FaCheckCircle className="text-md" />
                      ) : (
                        <FaPlusCircle className="text-md" />
                      )}
                      <span>{isJoined ? "Joined" : "Join"}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 text-center py-10 text-xl font-medium bg-gray-50 rounded-lg">
          No communities found
        </p>
      )}
    </div>
  );
};

export default SearchByCommunity;

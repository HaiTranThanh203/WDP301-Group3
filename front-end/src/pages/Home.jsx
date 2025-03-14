import React, { useEffect, useState } from "react";
import { getListUser } from "../services/UserAdminService"; // Điều chỉnh đường dẫn nếu cần
import {
  FaEllipsisV,
  FaThumbsUp,
  FaThumbsDown,
  FaComment,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import avatar2 from "../assets/images/avatar2.png";
import bag from "../assets/images/bag.png";
import { doGetAllPost, doVotePost } from "../services/PostService";
import { doGetUserById } from "../services/UserService";
export default function Home() {
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const userId = storedUser ? JSON.parse(storedUser).id : null;
  // Hàm mở/đóng dropdown của từng bài viết
  const toggleDropdown = (index) => {
    setDropdownOpen(dropdownOpen === index ? null : index);
  };
  const fetchUserDetail = async () => {
    try {
      const userDetail = await doGetUserById(userId);
      setUser(userDetail.data);
      console.log("Thông tin người dùng:", userDetail.data);
    } catch (error) {
      console.error("Không thể lấy thông tin người dùng:", error);
    }
  };
  const [Post, setPost] = useState([]);

  const [user, setUser] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await doGetAllPost(); // Gọi API đúng cách
        setPost(Array.isArray(data) ? data : []); // Kiểm tra xem data có phải là mảng không
      } catch (error) {
        console.error("Lỗi khi lấy bài viết:", error);
        setPost([]); // Nếu lỗi, gán mảng rỗng để tránh lỗi UI
      }
    };

    fetchPosts();
    fetchUserDetail();
  }, []);
  const handleVote = async (postId, vote) => {
    // Handle the vote up logic
    const res = await doVotePost(postId, vote);
    // Update the commentList state with the new vote information
    setPost((prevList) =>
      prevList.map((post) => {
        if (post._id === postId) {
          // Create a new votes object based on the current votes
          const updatedVotes = { ...post.votes };

          // Update the votes based on the action
          if (vote === true) {
            updatedVotes[user.id] = true; // User voted up
          } else if (vote === false) {
            updatedVotes[user.id] = false; // User voted down
          } else {
            delete updatedVotes[user.id]; // User removed their vote
          }

          // Return the updated comment object
          return { ...post, votes: updatedVotes };
        }
        return post; // Return the comment unchanged if it doesn't match
      })
    );
  };
  return (
    <div>
      <div className="flex flex-1">
        {/* Post Section */}
        <div className="flex-1 p-6 space-y-6">
          {/* Post 1 */}
          {Post?.map((post, index) => (
            <div
            key={post.id}
            className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate(`/postdetail/${post._id}`)} // Thêm sự kiện điều hướng
          >
              <div className="flex items-center space-x-2">
                <img
                  src={avatar2}
                  alt="User Avatar"
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <h2 className="font-semibold text-lg">{post.title}</h2>
                  <p
                    className="text-sm text-gray-500 cursor-pointer hover:underline"
                    onClick={() => {
                      navigate(`/viewcommunity/${post.communityId.id}`);
                    }}
                  >
                    {post.communityId.name
                      ? `Community: ${post.communityId.name}`
                      : "Community: N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour12: false,
                    })}
                  </p>
                </div>
                <div className="ml-auto relative">
                  <FaEllipsisV
                    className="text-gray-600 cursor-pointer rotate-90"
                    onClick={() => toggleDropdown(0)} // Mở hoặc đóng dropdown cho bài viết 1
                  />
                  {dropdownOpen === 0 && (
                    <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md w-40 text-sm text-gray-700">
                      <ul>
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                          Save post
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => navigate(`/reportpost/${post._id}`)}
                        >
                          Report post
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => navigate(`/editpost/${post._id}`)}
                        >
                          Edit Post
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-2 text-gray-700">
                {post.content.length > 200
                  ? `${post.content.substring(0, 200)}...`
                  : post.content}
              </p>
              {post.media.length > 0 && (
                <img
                  src={post.media[0]}
                  alt="Post Media"
                  className="mt-4 w-full h-64 object-cover"
                />
              )}
              {post.media.length == 0 && (
                <img
                  src={bag}
                  alt="Bag"
                  className="mt-4 w-32 h-32 object-cover"
                />
              )}
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center space-x-1 text-gray-500">
                  <FaThumbsUp
                    className={`text-lg cursor-pointer transition ${
                      post.votes && post.votes[user.id] === true
                        ? "text-blue-500" // Đổi màu xanh khi user đã like
                        : "text-gray-400 hover:text-blue-500"
                    }`}
                    onClick={() =>
                      post.votes && post.votes[user.id] === true
                        ? handleVote(post._id, "none")
                        : handleVote(post._id, true)
                    }
                  />
                  <span className="text-sm">
                    {
                      Object.values(post.votes || {}).filter(
                        (vote) => vote === true
                      ).length
                    }
                  </span>
                </div>

                {/* Nút Dislike */}
                <div className="flex items-center space-x-1 text-gray-500">
                  <FaThumbsDown
                    className={`text-lg cursor-pointer transition ${
                      post.votes && post.votes[user.id] === false
                        ? "text-red-500" // Đổi màu đỏ khi user đã dislike
                        : "text-gray-400 hover:text-red-500"
                    }`}
                    onClick={() =>
                      post.votes && post.votes[user.id] === false
                        ? handleVote(post._id, "none")
                        : handleVote(post._id, false)
                    }
                  />
                  <span className="text-sm">
                    {
                      Object.values(post.votes || {}).filter(
                        (vote) => vote === false
                      ).length
                    }
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500">
                  <FaComment className="text-lg" />
                  <span className="text-sm">{post.commentCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

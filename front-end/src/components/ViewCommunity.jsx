import React, { useEffect, useState } from "react";
import {
  FaEllipsisV,
  FaThumbsUp,
  FaThumbsDown,
  FaComment,
  FaCalendarAlt,
  FaGlobeAmericas,
} from "react-icons/fa"; // Icons for like, dislike, comment, calendar, globe
import avatar1 from "../assets/images/avatar1.png";
import avatar2 from "../assets/images/avatar2.png";
import avatar3 from "../assets/images/avatar3.png";
import bag from "../assets/images/bag.png";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { doVotePost } from "../services/PostService";
import { doGetUserById } from "../services/UserService";
import { toast } from "react-toastify";
import ManageCommunity from "./ManageCommunity";
const ViewCommunity = () => {
  const id = useParams().id;
  const [communityPost, setCommunityPost] = useState([]);
  const [communityDetail, setCommunityDetail] = useState({});
  const [user, setUser] = useState("");
  const storedUser = localStorage.getItem("user");
  const userId = storedUser ? JSON.parse(storedUser).id : null; // Kiểm tra trước khi truy cập .id
  const [showModal2, setShowModal2] = useState(false);
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");
  const [joinReason, setJoinReason] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const getCommunityPost = async () => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `http://localhost:9999/api/v1/communities/get-post/${id}`,
      headers: {},
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        setCommunityPost(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const getCommunityDetail = async () => {
    try {
      const response = await axios.get(
        `http://localhost:9999/api/v1/communities/${id}`
      );
      setCommunityDetail(response.data.data);
    } catch (error) {
      console.error("Error fetching community list:", error);
      throw error;
    }
  };
  const handleVote = async (postId, vote) => {
    // Handle the vote up logic
    const res = await doVotePost(postId, vote);
    // Update the commentList state with the new vote information
    setCommunityPost((prevList) =>
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
  const fetchUserDetail = async () => {
    try {
      const userDetail = await doGetUserById(userId);
      setUser(userDetail.data);
      console.log("Thông tin người dùng:", userDetail);
    } catch (error) {
      console.error("Không thể lấy thông tin người dùng:", error);
    }
  };
  const fetchUser = () => {
    axios
      .get(`http://localhost:9999/api/v1/communities/get-user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const result = response.data?.map((item) => item.userId);
        setUsers(result);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleJoin = () => {
    const joinData = JSON.stringify({
      userId: user.id,
      communityId: id,
      role: "member",
    });
    const config = {
      headers: { "Content-Type": "application/json" },
    };

    if (communityDetail?.privacyType === "public") {
      axios
        .post("http://localhost:9999/api/v1/communities/join", joinData, config)
        .then(() => {
          setShowModal2(false);
          toast.success("Joined community successfully!");
          navigate(`/viewcommunity/${id}`);
        })
        .catch((error) => console.log(error));
    } else {
      const data = JSON.stringify({
        joinRequests: [{ userId: user.id, reason: joinReason }],
      });

      axios
        .patch(`http://localhost:9999/api/v1/communities/request/${id}`, data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          setShowModal2(false);
          toast.success("Your request have send to moderator");
          setTimeout(() => {
            navigate(`/viewcommunity/${id}`);
          }, 3000);
        })
        .catch((error) => console.log(error));
    }
  };
  useEffect(() => {
    getCommunityPost();
    getCommunityDetail();
    fetchUserDetail();
    fetchUser();
  }, []);
  const handleSave = (sid) => {
    if (!user.bookmarks.includes(sid)) {
      user.bookmarks.push(sid);
    }
    localStorage.setItem("user", JSON.stringify(user));
    const data = JSON.stringify({ bookmarks: user.bookmarks });

    axios
      .patch("http://localhost:9999/api/v1/users/update-me", data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        toast.success("Save post success!");
        navigate(`/viewcommunity/${id}`);
      })
      .catch((error) => {
        console.error("Lỗi khi gửi yêu cầu:", error);
      });
  };
  // Tạo state để quản lý dropdown của từng bài viết
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // Hàm mở/đóng dropdown của từng bài viết
  const toggleDropdown = (index) => {
    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  return (
    <>
      <div className="bg-gray-100 min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-gray-300 p-8 flex items-center justify-between">
          {/* Avatar and Community Name */}
          <div className="flex items-center space-x-4">
            <img
              src={communityDetail.logo || avatar1}
              alt="Group Avatar"
              className="h-24 w-24 rounded-full border-4 border-white"
            />
            <h1 className="font-semibold text-lg">{communityDetail.name}</h1>
          </div>

          {/* Buttons */}
          <div className="flex space-x-2">
            {user?.moderatorCommunities?.includes(id) ? (
              <>
                <button
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md border hover:bg-gray-200 transition"
                  onClick={() => navigate(`/createpost`)}
                >
                  Create Post
                </button>
                <button
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md border hover:bg-gray-200 transition"
                  onClick={() => setShowModal(true)}
                >
                  Manage Community
                </button>
              </>
            ) : (
              <>
                {!users?.includes(user?.id) ? (
                  communityDetail?.joinRequests?.some(
                    (request) => request.userId === user.id
                  ) ? (
                    <button
                      className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md cursor-not-allowed"
                      disabled
                    >
                      Process
                    </button>
                  ) : (
                    <button
                      className={`px-4 py-2 text-white rounded-md transition ${
                        communityDetail?.privacyType === "public"
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "bg-gray-500 hover:bg-gray-600"
                      }`}
                      onClick={() =>
                        communityDetail?.privacyType === "public"
                          ? handleJoin()
                          : setShowModal2(true)
                      }
                    >
                      Join
                    </button>
                  )
                ) : (
                  <>
                    <button
                      className="px-4 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 transition"
                      onClick={() => navigate(`/createpost`)}
                    >
                      Create Post
                    </button>
                    <button
                      className="px-4 py-2 bg-green-500 text-white rounded-md cursor-not-allowed"
                      disabled
                    >
                      Joined
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1">
          {/* Post Section */}
          <div className="flex-1 p-6 space-y-6">
            {/* Post 1 */}
            {communityPost?.map((post, index) => (
              <div key={post.id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center space-x-2">
                  <img
                    src={avatar2}
                    alt="User Avatar"
                    className="h-12 w-12 rounded-full"
                  />
                  <div
                    className="cursor-pointer p-4  bg-white 
             hover:bg-white-100 transition duration-300 ease-in-out 
             active:scale-95"
                    onClick={() => navigate(`/postdetail/${post._id}`)}
                  >
                    <h2 className="font-semibold text-lg">{post.title}</h2>
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
                          <li
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSave(post?._id)}
                          >
                            Save post
                          </li>
                          <li
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => navigate(`/reportpost/${post._id}`)}
                          >
                            Report post
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
                    <FaComment
                      className="text-lg"
                      onClick={() => navigate(`/postdetail/${post._id}`)}
                    />
                    <span className="text-sm">{post.commentCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ManageCommunity
            showModal={showModal}
            setShowModal={setShowModal}
            community={communityDetail}
          />
          {/* Sidebar */}
          <div className="w-80 bg-gray-200 p-6 shadow-md space-y-8">
            <h2 className="font-semibold text-xl text-gray-800">
              {communityDetail.name} - {communityDetail.memberCount} Members
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {communityDetail.description}
            </p>

            <div className="flex items-center space-x-2 text-gray-600 text-sm">
              <FaCalendarAlt className="text-base" />
              <span>
                Created At -{" "}
                {new Date(communityDetail.createdAt).toDateString()}{" "}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 text-sm">
              <FaGlobeAmericas className="text-base" />
              <span>{communityDetail.privacyType}</span>
            </div>

            <h3 className="font-semibold text-xl mt-8 text-gray-800">RULES</h3>
            <ul className="text-sm text-gray-600 mt-4 space-y-4">
              {communityDetail?.communityRule?.split(".").map((item, index) => (
                <li key={index}>
                  Rule {index + 1}: {item.trim()}
                </li> // Sử dụng trim() để loại bỏ khoảng trắng ở đầu/cuối
              ))}
            </ul>
          </div>
        </div>
      </div>
      {showModal2 && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-semibold">Join Request</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowModal2(false)}
              >
                ✖
              </button>
            </div>

            {/* Body */}
            <div className="mt-4">
              <label className="block text-gray-700 font-medium mb-1">
                Reason
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter reason"
                value={joinReason}
                onChange={(e) => setJoinReason(e.target.value)}
              />
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                onClick={() => setShowModal2(false)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                onClick={handleJoin}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewCommunity;

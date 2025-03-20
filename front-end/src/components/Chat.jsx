import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaSearch } from "react-icons/fa";
import avatarDefault from "../assets/images/avatar1.png";
import socket from "../services/socketClient";
import { toast } from "react-toastify";
import { getFriends } from "../services/FriendShipService";
import { sendMessage, getMessages } from "../services/MessageService";

const Chat = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?.id;

  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20; // Nếu có hơn 20 tin nhắn, tự động phân trang

  // Ref cho container tin nhắn
  const messageContainerRef = useRef(null);

  // Use a ref to always have the latest selectedFriend inside our socket listener
  const selectedFriendRef = useRef(selectedFriend);
  useEffect(() => {
    selectedFriendRef.current = selectedFriend;
  }, [selectedFriend]);

  // Fetch friend list từ API
  const fetchFriends = async () => {
    try {
      const res = await getFriends(currentUserId);
      setFriends(res.data);
      if (res.data.length > 0) {
        setSelectedFriend(res.data[0]);
      }
    } catch (error) {
      toast.error("Error fetching friends: " + error.message);
    }
  };

  // Fetch messages cho cuộc trò chuyện (với phân trang)
  const fetchMessages = async (friendId, page = 1) => {
    try {
      const res = await getMessages(currentUserId, friendId, limit, page);
      // Nếu page = 1, set toàn bộ tin nhắn, còn nếu >1, prepend tin nhắn cũ vào state
      if (page === 1) {
        setMessages(res.data);
      } else {
        setMessages((prev) => [...res.data, ...prev]);
      }
      setHasMore(page < res.totalPages);
      setCurrentPage(page);
    } catch (error) {
      toast.error("Error fetching messages: " + error.message);
    }
  };

  // Fetch danh sách bạn bè và join room
  useEffect(() => {
    if (currentUserId) {
      fetchFriends();
      socket.emit("joinRoom", currentUserId);
    }
  }, [currentUserId]);

  // Khi chọn friend mới, load trang 1 của cuộc trò chuyện
  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend._id, 1);
    }
  }, [selectedFriend]);

  // Lắng nghe socket để nhận tin nhắn realtime
  useEffect(() => {
    const handleNewMessage = (newMsg) => {
      if (
        selectedFriendRef.current &&
        ((newMsg.sender === currentUserId &&
          newMsg.recipient === selectedFriendRef.current._id) ||
          (newMsg.sender === selectedFriendRef.current._id &&
            newMsg.recipient === currentUserId))
      ) {
        setMessages((prev) => [...prev, newMsg]);
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [currentUserId]);

  // Handler gửi tin nhắn

  // Handler for sending a message (cách 1: không cập nhật state, chờ socket)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedFriend) return;
    try {
      await sendMessage(currentUserId, selectedFriend._id, message);
      setMessage("");
    } catch (error) {
      toast.error("Error sending message: " + error.message);
    }
  };

  // Hàm tự động load thêm tin nhắn cũ (page tiếp theo)
  const fetchMoreMessages = async () => {
    if (selectedFriend) {
      const nextPage = currentPage + 1;
      try {
        const res = await getMessages(
          currentUserId,
          selectedFriend._id,
          limit,
          nextPage
        );
        setMessages((prev) => [...res.data, ...prev]); // Prepend tin nhắn cũ vào danh sách
        setCurrentPage(nextPage);
        setHasMore(nextPage < res.totalPages);
      } catch (error) {
        toast.error("Error loading more messages: " + error.message);
      }
    }
  };

  // Sử dụng scroll event để tự động load tin nhắn cũ khi cuộn lên đầu container
  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      // Nếu cuộn lên gần đầu (ví dụ: scrollTop < 50px) và còn tin nhắn cũ
      if (container.scrollTop < 50 && hasMore) {
        fetchMoreMessages();
      }
    };

    container.addEventListener("scroll", onScroll);
    return () => {
      container.removeEventListener("scroll", onScroll);
    };
  }, [hasMore, currentPage, selectedFriend]);

  // Lọc danh sách bạn bè theo search term
  const filteredFriends = friends.filter((friend) => {
    const friendName = friend.displayName || friend.username;
    return friendName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex h-screen">
      {/* Sidebar: Danh sách bạn bè và ô tìm kiếm */}
      <div className="w-1/4 bg-gray-100 p-4 flex flex-col">
        <h2 className="text-lg font-semibold text-gray-700">Friends</h2>
        <div className="mt-4 flex items-center bg-white border border-gray-300 p-2 rounded-md">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search friend..."
            className="bg-transparent w-full outline-none text-gray-600 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ul className="mt-4 space-y-2 overflow-y-auto flex-1">
          {filteredFriends.map((friend) => (
            <li
              key={friend._id}
              onClick={() => setSelectedFriend(friend)}
              className={`flex items-center space-x-2 cursor-pointer p-2 rounded-md ${
                selectedFriend && friend._id === selectedFriend._id
                  ? "bg-gray-200"
                  : ""
              }`}
            >
              <img
                src={friend.avatar || avatarDefault}
                alt={friend.displayName || friend.username}
                className="h-8 w-8 rounded-full"
              />
              <span className="text-sm text-gray-700">
                {friend.displayName || friend.username}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Section */}
      <div className="flex-1 bg-white flex flex-col p-4">
        {/* Header: Thông tin người bạn được chọn */}
        <div className="flex items-center border-b border-gray-300 pb-2">
          <img
            src={
              selectedFriend
                ? selectedFriend.avatar || avatarDefault
                : avatarDefault
            }
            alt={
              selectedFriend
                ? selectedFriend.displayName || selectedFriend.username
                : ""
            }
            className="h-10 w-10 rounded-full mr-3"
          />
          <h2 className="text-base font-semibold text-gray-700">
            {selectedFriend
              ? selectedFriend.displayName || selectedFriend.username
              : "Select a friend"}
          </h2>
        </div>

        {/* Message list */}
        <div
          ref={messageContainerRef}
          className="flex-1 mt-2 space-y-2 overflow-y-auto"
        >
          {messages?.length > 0 ? (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  msg.sender === currentUserId ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-xs px-3 py-1 rounded-lg text-white ${
                    msg.sender === currentUserId
                      ? "bg-orange-400"
                      : "bg-gray-400"
                  }`}
                >
                  <p className="text-sm">{msg.plainContent}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(msg.updatedAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No messages</p>
          )}
        </div>

     
        {friends.length > 0 ? (
  <form
    onSubmit={handleSendMessage}
    className="mt-2 pt-2 border-t border-gray-300 flex items-center"
  >
    <input
      type="text"
      placeholder="Type your message..."
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-md mr-3 text-sm"
    />
    <button
      type="submit"
      className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
    >
      <FaPaperPlane />
    </button>
  </form>
) : (
  <p className="text-gray-500 text-center mt-4">
    Bạn chưa có bạn bè nào để nhắn tin.
  </p>
)}

      </div>
    </div>
  );
};

export default Chat;

import React, { useState } from "react";
import {
  FaHome,
  FaNewspaper,
  FaComments,
  FaGamepad,
  FaQuestionCircle,
  FaBook,
  FaCaretDown,
  FaUserFriends
} from "react-icons/fa"; // Import các icon

export default function Sidebar() {
  const [isCommunitiesOpen, setIsCommunitiesOpen] = useState(false); // Quản lý mở/đóng Communities

  const toggleCommunities = () => {
    setIsCommunitiesOpen(!isCommunitiesOpen); // Chuyển trạng thái mở/đóng cho communities
  };

  return (
    <aside className="bg-white text-gray-800 w-64 p-6 space-y-8 shadow-md">
      <ul className="space-y-6">
        {/* Home */}
        <li className="flex items-center space-x-4">
          <FaHome className="text-xl" />

          <a href="/" className="text-lg hover:text-indigo-400">
            Home
          </a>
        </li>
        {/* News */}
        <li className="flex items-center space-x-4">
          <FaNewspaper className="text-xl" />

          <a href="/news" className="text-lg hover:text-indigo-400">News</a>

        </li>
        {/* Chat */}
        <li className="flex items-center space-x-4">
          <FaComments className="text-xl" />
          <a href="/chat" className="text-lg hover:text-indigo-400">
            Chat
          </a>
        </li>
        <li className="flex items-center space-x-4">
          <FaUserFriends className="text-xl" />
          <a href="/listfriend" className="text-lg hover:text-indigo-400">
            Friends
          </a>
        </li>

        {/* Đường kẻ giữa */}
        <li className="border-t border-gray-300 pt-4"></li>

        {/* Your Communities với icon dropdown */}
        <li className="flex items-center space-x-4" onClick={toggleCommunities}>
          <span className="text-lg">Your Communities</span>
          <FaCaretDown
            className={`text-gray-600 ${
              isCommunitiesOpen ? "transform rotate-180" : ""
            }`}
          />
        </li>

        {/* Mục con của Your Communities */}
        {isCommunitiesOpen && (
          <ul className="pl-6 space-y-2">
            <li className="flex items-center space-x-4">
              <a
                href="/createcommunity"
                className="text-lg text-red-500 hover:text-red-600"
              >
                + Create Community
              </a>
            </li>

            <li className="flex items-center space-x-4">
              <FaGamepad className="text-xl" />
              <a href="#" className="text-lg hover:text-indigo-400">
                Games
              </a>
            </li>
            <li className="flex items-center space-x-4">
              <FaQuestionCircle className="text-xl" />
              <a href="#" className="text-lg hover:text-indigo-400">
                Q&A Questions
              </a>
            </li>
            <li className="flex items-center space-x-4">
              <FaBook className="text-xl" />
              <a href="#" className="text-lg hover:text-indigo-400">
                Education
              </a>
            </li>
          </ul>
        )}
      </ul>
    </aside>
  );
}

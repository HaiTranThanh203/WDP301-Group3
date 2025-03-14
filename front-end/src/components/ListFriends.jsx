import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  getUserFriendships,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
} from '../services/FriendShipService';

// Giả sử currentUserId được lấy từ context hoặc localStorage
const currentUser = JSON.parse(localStorage.getItem("user")) || null;
const currentUserId = currentUser?.id || "67138908290ef9092c172bbf";
console.log(currentUserId);


const ListFriends = () => {
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Lấy danh sách mối quan hệ của user
  const fetchFriendships = async () => {
    try {
      const res = await getUserFriendships(currentUserId);
      if (res.success) {
        setAcceptedFriends(res.accepted);
        setPendingInvitations(res.pending);
      }
    } catch (error) {
      toast.error('Lỗi khi lấy danh sách mối quan hệ');
      console.error('Lỗi lấy danh sách mối quan hệ', error);
    }
  };

  useEffect(() => {
    fetchFriendships();
  }, []);

  // Chấp nhận lời mời kết bạn
  const handleAcceptInvitation = async (friendship) => {
    try {
      await acceptFriendRequest(friendship.friend._id, currentUserId);
      toast.success('Kết bạn thành công');
      fetchFriendships();
    } catch (error) {
      toast.error('Lỗi khi chấp nhận lời mời kết bạn');
      console.error('Lỗi khi chấp nhận lời mời kết bạn', error);
    }
  };

  // Từ chối lời mời kết bạn
  const handleRejectInvitation = async (friendship) => {
    try {
      await rejectFriendRequest(friendship.friend._id, currentUserId);
      toast.success('Từ chối lời mời kết bạn thành công');
      fetchFriendships();
    } catch (error) {
      toast.error('Lỗi khi từ chối lời mời kết bạn');
      console.error('Lỗi khi từ chối lời mời kết bạn', error);
    }
  };

  // Hủy kết bạn (unfriend)
  const handleUnfriend = async () => {
    if (!selectedFriend) return;
    try {
      await unfriend(currentUserId, selectedFriend.friend._id);
      toast.success('Hủy kết bạn thành công');
      fetchFriendships();
      closeModal();
    } catch (error) {
      toast.error('Lỗi khi hủy kết bạn');
      console.error('Lỗi khi hủy kết bạn', error);
    }
  };

  const openModal = (friendship) => {
    setSelectedFriend(friendship);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFriend(null);
  };

  return (
    <div className="p-6">
      <div className="flex space-x-10">
        {/* Danh sách bạn bè đã kết */}
        <div className="flex-1">
          <h2 className="font-semibold text-lg mb-4">List Friends</h2>
          <div className="border-b border-gray-300 mb-4"></div>
          <div className="grid grid-cols-2 gap-6">
            {acceptedFriends && acceptedFriends.length > 0 ? (
              acceptedFriends.map((friendship) => (
                <div
                  key={friendship.friend._id}
                  className="flex items-center justify-center"
                >
                  <img
                    src={friendship.friend.avatar || '/default-avatar.png'}
                    alt={
                      friendship.friend.displayName ||
                      friendship.friend.username
                    }
                    className="h-16 w-16 rounded-full"
                  />
                  <span className="ml-2">
                    {friendship.friend.displayName ||
                      friendship.friend.username}
                  </span>
                  <FaTimes
                    className="ml-2 text-red-500 cursor-pointer"
                    onClick={() => openModal(friendship)}
                  />
                </div>
              ))
            ) : (
              <div>Không có bạn bè nào</div>
            )}
          </div>
        </div>

        {/* Danh sách lời mời kết bạn */}
        <div className="border-l border-gray-300 px-6">
          <h2 className="font-semibold text-lg mb-4">Invitation</h2>
          <div className="space-y-4">
            {pendingInvitations && pendingInvitations.length > 0 ? (
              pendingInvitations.map((friendship) => (
                <div
                  key={friendship.friend._id}
                  className="flex items-center space-x-4"
                >
                  <img
                    src={friendship.friend.avatar || '/default-avatar.png'}
                    alt={
                      friendship.friend.displayName ||
                      friendship.friend.username
                    }
                    className="h-12 w-12 rounded-full"
                  />
                  <span className="ml-2">
                    {friendship.friend.displayName ||
                      friendship.friend.username}
                  </span>
                  <FaCheck
                    className="ml-2 text-green-500 cursor-pointer"
                    onClick={() => handleAcceptInvitation(friendship)}
                  />
                  <FaTimes
                    className="ml-2 text-red-500 cursor-pointer"
                    onClick={() => handleRejectInvitation(friendship)}
                  />
                </div>
              ))
            ) : (
              <div>Không có lời mời nào</div>
            )}
          </div>
        </div>
      </div>

      {/* Modal xác nhận hủy kết bạn */}
      {isModalOpen && selectedFriend && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h3 className="text-xl font-semibold">
              Are you sure to unfriend{' '}
              {selectedFriend.friend.displayName ||
                selectedFriend.friend.username}
              ?
            </h3>
            <div className="mt-4 flex justify-between">
              <button
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                onClick={handleUnfriend}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container hiển thị thông báo */}
      <ToastContainer />
    </div>
  );
};

export default ListFriends;

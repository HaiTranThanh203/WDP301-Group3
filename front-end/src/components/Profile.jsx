import React, { useEffect, useState } from "react";
import frogImage from "../assets/images/Avatar.png";

function Profile() {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadAvatar, setUploadAvatar] = useState("");
  const [editUsername, setEditUsername] = useState(false);
  const [editStudentCode, setEditStudentCode] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newStudentCode, setNewStudentCode] = useState("");
  const [bookmarks, setBookmarks] = useState([]);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:9999/api/v1/users/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        // console.log("Dữ liệu user nhận được:", data); // Kiểm tra response từ API

        if (data.status === "success") {
          setUser({
            ...data.data,
            avatar: data.data.avatar || "/default-avatar.png", // Nếu avatar null thì gán ảnh mặc định
          });
          setNewUsername(data.data.username);
          setNewStudentCode(data.data.studentCode);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await fetch("http://localhost:9999/api/v1/users/bookmarked-posts", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        if (data.status === "success") {
          setBookmarks(data.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bookmark:", error);
      }
    };

    fetchBookmarks();
  }, []);



  useEffect(() => {
    if (isModalOpen) {
      setOldPassword("");
      setNewPassword("");
      setErrorMessage("");
      setSuccessMessage("");
    }
  }, [isModalOpen]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setTimeout(() => {
      setOldPassword("");
      setNewPassword("");
    }, 0);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChangePassword = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (newPassword.length < 6) {
      setErrorMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    try {
      const res = await fetch("http://localhost:9999/api/v1/users/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (data.status === "success") {
        alert("Mật khẩu đã thay đổi, bạn sẽ được chuyển đến trang đăng nhập sau 3 giây!");
        localStorage.removeItem("token");
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      } else {
        setErrorMessage(data.message || "Đổi mật khẩu thất bại.");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API đổi mật khẩu:", error);
      setErrorMessage("Lỗi kết nối.");
    }
  };

  const handleUploadAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadAvatar(URL.createObjectURL(file));
      updateProfile({ avatar: URL.createObjectURL(file) });
    }
  };

  const updateProfile = async (updateData) => {
    try {
      const res = await fetch("http://localhost:9999/api/v1/users/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      if (data.status === "success") {
        setUser(data.data);
        setNewUsername(data.data.username);
        setNewStudentCode(data.data.studentCode);
        setSuccessMessage("Cập nhật thông tin thành công!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(data.message || "Cập nhật hồ sơ thất bại.");
      }
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);
      setErrorMessage("Lỗi kết nối.");
    }
  };

  const handleUsernameEdit = () => {
    updateProfile({ username: newUsername });
    setEditUsername(false);
  };

  const handleStudentCodeEdit = () => {
    updateProfile({ studentCode: newStudentCode });
    setEditStudentCode(false);
  };

  if (!user) {
    return <p>Đang tải...</p>;
  }




  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      <h2 className="text-2xl font-semibold text-blue-600 mb-4">Profile</h2>
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">General:</h3>
        <div className="flex items-start">
          <div className="w-1/4">
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-24 h-24 rounded-full border border-gray-300"
            />
            <label htmlFor="avatarUpload" className="mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded inline-flex items-center cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload new images
            </label>
            <input
              type="file"
              id="avatarUpload"
              accept="image/*"
              className="hidden"
              onChange={handleUploadAvatar}
            />
          </div>
          <div className="w-3/4 pl-6">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <span className="w-1/4 font-semibold">Email:</span>
                <span className="w-3/4">{user.email || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <span className="w-1/4 font-semibold">Username:</span>
                {editUsername ? (
                  <>
                    <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="w-3/4 border rounded p-1" />
                    <button onClick={handleUsernameEdit}>Save</button>
                  </>
                ) : (
                  <>
                    <span className="w-3/4">{user.username || "N/A"}</span>
                    <svg onClick={() => setEditUsername(true)} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-gray-500 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732a2.5 2.5 0 013.536 3.536z" />
                    </svg>
                  </>
                )}
              </div>
              <div className="flex items-center">
                <span className="w-1/4 font-semibold">Student Code:</span>
                {editStudentCode ? (
                  <>
                    <input
                      type="text"
                      value={newStudentCode}
                      onChange={(e) => setNewStudentCode(e.target.value)}
                      className="w-3/4 border rounded p-1"
                    />
                    <button onClick={handleStudentCodeEdit}>Save</button>
                  </>
                ) : (
                  <>
                    <span className="w-3/4">{user.studentCode || "N/A"}</span>
                    <svg onClick={() => setEditStudentCode(true)} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-gray-500 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732a2.5 2.5 0 013.536 3.536z" />
                    </svg>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-start space-x-4">
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded" onClick={() => window.location.href = "/listfriend"}>
          View List Friends
        </button>
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
          onClick={handleOpenModal}
        >
          Change Password
        </button>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          Bookmarks
        </h3>

        {bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="border rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-gray-50 flex flex-col"
              >
                {/* Phần hiển thị ảnh */}
                {bookmark.media && (
                  <div className="mb-3">
                    <img
                      src={bookmark.media || 'frogImage'}
                      alt={bookmark.title}
                      className="w-full h-48 object-cover rounded-md"
                      onError={(e) => {
                        e.target.src = 'path/to/placeholder-image.jpg'; // Thêm ảnh placeholder nếu ảnh lỗi
                      }}
                    />
                  </div>
                )}

                {/* Phần thông tin */}
                <div className="flex-1">
                  <h4 className="text-base font-medium text-gray-800 line-clamp-2 mb-2">
                    {bookmark.title}
                  </h4>
                  {/* Thêm phần content */}
                  {bookmark.content && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                      {bookmark.content}
                    </p>
                  )}
                  {bookmark.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {bookmark.description}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    <span>Saved on: {new Date(bookmark.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <p className="text-base">No bookmarked posts yet.</p>
            <p className="text-sm mt-2 text-gray-400">
              Start bookmarking posts to see them here!
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center">
          <div className="bg-white rounded-lg p-10 w-1/5 max-h-screen overflow-y-auto z-5 border-orange-400 border-2">
            <h2 className="text-2xl font-semibold mb-4 text-center text-orange-400 ">Change Password</h2>
            {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}
            {successMessage && <p className="text-green-500 mb-2">{successMessage}</p>}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Old Password:
              </label>
              <input
                type="password"
                value={oldPassword}
                autoComplete="new-password"
                onChange={(e) => setOldPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                New Password:
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded"
                onClick={handleChangePassword}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>




  );
}

export default Profile;
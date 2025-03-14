import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUpload } from "react-icons/fa";
import { uploadImageToSupabase } from "../utils/uploadImageSupabase";

const EditPost = () => {
  const { postId } = useParams(); // ✅ Lấy postId từ URL
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]); // ✅ Danh sách Community theo userId
  const [community, setCommunity] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Lấy userId từ localStorage
  const user = JSON.parse(localStorage.getItem("user")) || null;
  const userId = user?.id || "";
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    if (!userId) {
      setError("⚠ You are not logged in!");
      return;
    }

    // ✅ Lấy danh sách community của user
    const fetchCommunities = async () => {
      try {
        console.log("📌 Fetching communities...");
        const res = await axios.get(`http://localhost:9999/api/v1/communities/get-user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCommunities(res.data?.data || []);
      } catch (err) {
        console.error("🚨 Error fetching communities:", err.response?.data || err);
        setCommunities([]);
      }
    };

    // ✅ Lấy dữ liệu bài đăng hiện tại
    const fetchPost = async () => {
      try {
        console.log(`📌 Fetching post data for ID: ${postId}`);
        const response = await axios.get(`http://localhost:9999/api/v1/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.data) {
          const post = response.data.data;
          setCommunity(post.communityId._id || ""); // ✅ Chọn Community hiện tại
          setTitle(post.title);
          setDescription(post.content);
          if (post.media && post.media.length > 0) {
            setPreviewImage(post.media[0]); // Hiển thị ảnh cũ nếu có
          }
        }
      } catch (err) {
        setError("⚠ Error loading post data.");
      }
    };

    fetchCommunities();
    fetchPost();
  }, [postId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreviewImage(URL.createObjectURL(file)); // Hiển thị ảnh mới
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let imageUrl = previewImage;

      if (image) {
        console.log("📸 Uploading new image...");
        imageUrl = await uploadImageToSupabase(image);
        console.log("✅ New Image URL:", imageUrl);
      }

      const updatedPost = {
        communityId: community,
        title,
        content: description,
        media: imageUrl ? [imageUrl] : [],
      };

      console.log("📌 Sending updated post data:", updatedPost);

      const response = await axios.patch(`http://localhost:9999/api/v1/posts/edit/${postId}`, updatedPost, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        setSuccess("✅ Post updated successfully!");
        setTimeout(() => navigate(`/post/${postId}`), 1500);
      } else {
        setError("❌ Failed to update post.");
      }
    } catch (err) {
      setError("🚨 Error updating post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Edit Post</h2>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

      <form onSubmit={handlePostUpdate}>
        {/* Community Dropdown */}
        <div className="mb-4">
          <label htmlFor="community" className="block text-sm text-gray-600 mb-2">Choose your community:</label>
          <select
            id="community"
            value={community}
            onChange={(e) => setCommunity(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Select Community --</option>
            {communities.length > 0 ? (
              communities.map((comm) => (
                <option key={comm._id} value={comm._id}>{comm.name}</option>
              ))
            ) : (
              <option value="" disabled>No communities joined</option>
            )}
          </select>
        </div>

        {/* Title Input */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm text-gray-600 mb-2">Title:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-4 flex items-center">
          <label htmlFor="image" className="block text-sm text-gray-600 mb-2">Image:</label>
          <div className="ml-4 flex items-center">
            <input id="image" type="file" onChange={handleImageChange} className="hidden" />
            <label htmlFor="image" className="text-sm text-indigo-500 cursor-pointer flex items-center">
              <FaUpload className="mr-2" />
              Edit Images
            </label>
            {previewImage && (
              <img
                src={previewImage}
                alt="Uploaded"
                className="ml-4 w-16 h-16 object-cover rounded-md"
              />
            )}
          </div>
        </div>

        {/* Description Textarea */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm text-gray-600 mb-2">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="5"
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-orange-500 text-white py-2 px-4 rounded-md text-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? "Updating..." : "Edit Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;

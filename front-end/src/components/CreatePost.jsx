import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUpload } from 'react-icons/fa';
import { uploadImageToSupabase } from '../utils/uploadImageSupabase';

const CreatePost = () => {
  const [communities, setCommunities] = useState([]);
  const [community, setCommunity] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Lấy userId từ localStorage
  const user = JSON.parse(localStorage.getItem('user')) || null;
  const userId = user?.id || '';

  console.log("📌 Retrieved userId:", userId);

  useEffect(() => {
    if (!userId) {
      console.error("❌ userId is missing! API request not sent.");
      return;
    }

    const apiUrl = `http://localhost:9999/api/v1/communities/get-user/${userId}`;
    console.log("📌 Fetching communities from:", apiUrl);

    axios.get(apiUrl)
      .then(response => {
        console.log("✅ API Response:", response.data);
        if (response.data && response.data.success) {
          setCommunities(response.data.data || []);
        } else {
          console.warn("⚠️ No communities found.");
          setCommunities([]);
        }
      })
      .catch(error => {
        console.error("🚨 Error fetching user communities:", error.response?.data || error);
        setCommunities([]);
      });
  }, [userId]);

  if (!userId) {
    return <p className="text-red-500 text-center">⚠ You must be logged in to create a post.</p>;
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
  
    if (!community || !title.trim() || !description.trim()) {
      setError('⚠ Please select a community and fill in all required fields.');
      setLoading(false);
      return;
    }
  
    try {
      let imageUrl = '';
  
      if (image) {
        console.log("📸 Uploading file:", image);
        imageUrl = await uploadImageToSupabase(image);
        console.log("✅ Uploaded Image URL:", imageUrl);
      }
  
      const postData = {
        userId,
        communityId: community,
        title,
        content: description,
        media: imageUrl ? [imageUrl] : [], 
      };
  
      console.log("📌 Sending Post Data:", postData);
  
      const token = localStorage.getItem("token") || "";
      console.log("🔑 Using token:", token);
  
      const postRes = await axios.post(
        'http://localhost:9999/api/v1/posts/create',
        postData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
  
      console.log("✅ Full API Response:", postRes); // ✅ Thêm log toàn bộ phản hồi
  
      if (postRes && postRes.data) {  // ✅ Kiểm tra xem postRes.data có tồn tại không
        console.log("✅ Post Created:", postRes.data);
  
        if (postRes.status === 201) {
          setSuccess('🎉 Post created successfully!');
          setCommunity('');
          setTitle('');
          setDescription('');
          setImage(null);
          setPreviewImage(null);
        } else {
          setError('❌ Failed to create post.');
        }
      } else {
        console.error("🚨 API Response missing data:", postRes);
        setError('❌ Unexpected response from the server.');
      }
  
    } catch (error) {
      console.error("❌ Error submitting post:", error.response || error);
  
      if (error.response) {
        console.log("🚨 Server Response Error:", error.response.data);
        setError(`🚨 Error: ${error.response.data.message || "Server error"}`);
      } else {
        setError('🚨 Error creating post. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  
  

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Post</h2>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

      <form onSubmit={handlePostSubmit}>
        {/* Dropdown chọn community */}
        <div className="mb-4">
          <label htmlFor="community" className="block text-sm text-gray-600 mb-2">Select Community:</label>
          <select
            id="community"
            value={community}
            onChange={(e) => setCommunity(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
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

        {/* Title */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm text-gray-600 mb-2">Title:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your title"
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label htmlFor="image" className="block text-sm text-gray-600 mb-2">Upload Image:</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <label htmlFor="image" className="cursor-pointer flex items-center">
            <span className="mr-2">Upload Image</span>
            <FaUpload className="text-gray-600" />
          </label>
          {previewImage && <img src={previewImage} alt="Preview" className="mt-4 w-32 h-32 object-cover rounded-md" />}
        </div>

        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm text-gray-600 mb-2">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter your description"
            rows="5"
            className="w-full p-2 border border-gray-300 rounded-md"
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition duration-300"
          disabled={loading}
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;

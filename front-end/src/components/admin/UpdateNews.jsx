import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDetailNewsById, updateNews } from '../../services/NewsService';
import { uploadImageToSupabase } from '../../utils/uploadImageSupabase';
import { message } from 'antd';

const UpdateNews = () => {
  const { id } = useParams(); // Get news ID from URL
  const navigate = useNavigate();

  // State for form fields
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState(null); // for new image file
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(true); // true = Active, false = Deactive
  const [loading, setLoading] = useState(true);
  const [existingImageURL, setExistingImageURL] = useState(''); // store current image URL

  // Fetch news detail and prefill the form fields
  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        const response = await getDetailNewsById(id);
        const newsData = response.data; // assume news details are in response.data
        setTitle(newsData.title || '');
        setDescription(newsData.content || '');
        setStatus(newsData.isActive); 
        setExistingImageURL(newsData.image || '');
      } catch (error) {
        console.error('Error fetching news detail:', error);
        message.error('Failed to load news detail.');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalImageURL = existingImageURL; // default to existing image URL
      if (imageFile) {
        // If a new image is selected, upload it to Supabase and get the public URL
        finalImageURL = await uploadImageToSupabase(imageFile);
        console.log("Uploaded image URL:", finalImageURL);
      }

      // Build the payload to update news.
      // Adjust field names if your API expects different names.
      const payload = {
        title,
        content: description,
        isActive: status,
        image: finalImageURL,
      };

      await updateNews(id, payload);
      message.success('News updated successfully!');
      navigate(`/admin/news-detail/${id}`);
    } catch (error) {
      console.error('Error updating news:', error);
      message.error('Update failed!');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xl">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-semibold text-center mb-8">Update News</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-lg font-medium text-gray-700">
            Title: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter your title"
            className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Image Input */}
        <div>
          <label className="block text-lg font-medium text-gray-700">Image:</label>
          <input
            type="file"
            accept="image/*"
            className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          {/* Show a preview of the current image if no new image is selected */}
          {!imageFile && existingImageURL && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Current Image:</p>
              <img
                src={existingImageURL}
                alt="Current"
                className="w-32 h-32 object-cover rounded-md border"
              />
            </div>
          )}
          {imageFile && (
            <div className="mt-2">
              <p className="text-sm text-blue-600">New image selected.</p>
            </div>
          )}
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-lg font-medium text-gray-700">Description:</label>
          <textarea
            placeholder="Enter your description"
            className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows="5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Status Input (Active/Deactive) */}
        <div>
          <label className="block text-lg font-medium text-gray-700">Status:</label>
          <select
            className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={status ? 'true' : 'false'}
            onChange={(e) => setStatus(e.target.value === 'true')}
          >
            <option value="true">Active</option>
            <option value="false">Deactive</option>
          </select>
        </div>

        {/* Update Button */}
        <button
          type="submit"
          className="w-full py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 mt-6 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default UpdateNews;

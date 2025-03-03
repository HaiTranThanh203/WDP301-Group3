import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNews } from '../../services/NewsService';
import { uploadImageToSupabase } from '../../utils/uploadImageSupabase';
import { message } from 'antd';

function CreateNew() {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null); // To hold the selected file from the user's machine
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = '123';
      if (file) {
        // Upload image file to Supabase Storage and get its public URL
        imageUrl = await uploadImageToSupabase(file, 'fpt-image');
        console.log('Uploaded image URL 2:', imageUrl);
      }

      // Build the payload to send to the back-end.
      // Note: if your API expects the news content in a field named 'content', use that instead of 'description'
      const newsData = {
        title,
        image: imageUrl,
        content: description, // Use "content" instead of "description" if that's what your API expects
      };

      // Call your API to create news
      const createdNews = await createNews(newsData);
      message.success('News created successfully!');
      // Navigate to the detail page using the returned ID
      navigate(`/admin/news-detail/${createdNews.id || createdNews._id}`);
    } catch (error) {
      // Log the full error response to help with debugging
      console.error('Error creating news:', error.response || error);
      message.error('Error creating news!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-semibold mb-8 text-center">Create News</h1>
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
            onChange={(e) => setFile(e.target.files[0])}
          />
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

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 mt-6 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          Create
        </button>
      </form>
    </div>
  );
}

export default CreateNew;

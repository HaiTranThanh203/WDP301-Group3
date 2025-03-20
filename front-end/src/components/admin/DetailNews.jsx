import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getDetailNewsById } from '../../services/NewsService';
import { message } from 'antd';

const DetailNews = () => {
  const { id } = useParams(); // Lấy id từ URL
  const navigate = useNavigate();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        const response = await getDetailNewsById(id);
        console.log("News detail:", response.data);
        setNewsItem(response.data);
      } catch (error) {
        console.error("Error fetching news detail:", error);
        message.error("Error fetching news detail");
      } finally {
        setLoading(false);
      }
    };
    fetchNewsDetail();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-xl">Loading...</div>;
  }

  if (!newsItem) {
    return <div className="p-8 text-center text-xl">News not found</div>;
  }

  return (
    <div className="p-8 bg-white shadow-2xl rounded-xl max-w-4xl mx-auto">
      {/* Title */}
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        {newsItem.title}
      </h1>

      /* Image & Dates */
        <div className="mb-8">
        <img
          src={newsItem.image || 'https://via.placeholder.com/800x400'}
          alt={newsItem.title}
          className="w-full h-64 object-cover rounded-md border-4 border-blue-200"
        />
        <div className="mt-4 flex justify-center items-center space-x-2 text-sm text-gray-500">
          <span>
            Created: {new Date(newsItem.createdAt).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <span className="text-gray-400">|</span>
          <span>
            Updated: {new Date(newsItem.updatedAt).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mb-8">
        <p className="text-lg text-gray-700 leading-relaxed">
          {newsItem.content}
        </p>
      </div>

      {/* Meta Information */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <strong className="text-gray-800">Status:</strong>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              newsItem.isActive
                ? 'bg-green-100 text-green-600'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {newsItem.isActive ? 'Active' : 'Deactive'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <strong className="text-gray-800">Author:</strong>
          <span className="text-gray-700">
            {newsItem.authorId?.username || 'HaiTran'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link
          to={`/admin/update-news/${newsItem.id || newsItem._id}`}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-8 rounded-md shadow-md text-sm"
        >
          Update News
        </Link>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-8 rounded-md shadow-md text-sm focus:outline-none"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default DetailNews;
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDetailNewsById } from '../services/NewsService';
import { message } from 'antd';

function NewsDetail() {
  const { id } = useParams();           // Get the news ID from the URL
  const navigate = useNavigate();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNewsDetail() {
      try {
        const response = await getDetailNewsById(id);
        // Assume response.data holds the news item
        setNewsItem(response.data);
      } catch (error) {
        console.error('Error fetching news detail:', error);
        message.error('Failed to load news detail.');
      } finally {
        setLoading(false);
      }
    }
    fetchNewsDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-lg">
        Loading news detail...
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="p-8 text-center text-lg">
        News not found.
      </div>
    );
  }

  // Format the published date
  const publishedDate = new Date(newsItem.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">News</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Image Section */}
        <div className="md:w-1/3 flex-shrink-0">
          <img
            src={newsItem.image}
            alt={newsItem.title}
            className="w-full h-auto object-cover rounded-md shadow"
          />
        </div>

        {/* Text Section */}
        <div className="md:w-2/3">
          <h2 className="text-2xl font-semibold mb-2">
            {newsItem.title}
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Published {publishedDate}
          </p>
          <p className="text-gray-700 leading-relaxed">
            {newsItem.content /* or newsItem.description */}
          </p>
        </div>
      </div>

      {/* Back Button (optional) */}
      <div className="mt-8">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

export default NewsDetail;

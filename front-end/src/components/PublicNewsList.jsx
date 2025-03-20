import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { message } from 'antd';
import { getListNews } from '../services/NewsService';

function PublicNewsList() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6; // items per page

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // If your API supports server-side pagination and isActive filter:
        // getListNews(page, limit, true /* isActive */, '')
        const response = await getListNews(page, limit, true, '');
        // Suppose response contains { data, totalPages, ... }
        setNews(response.data || []);
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error('Error fetching news:', error);
        message.error('Failed to load news.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [page]);

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePageChange = (e) => {
    const selectedPage = Number(e.target.value);
    setPage(selectedPage);
  };

  if (loading) {
    return <div className="p-8 text-center text-lg">Loading news...</div>;
  }

  if (!news.length) {
    return <div className="p-8 text-center text-lg">No active news found.</div>;
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">News</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {news.map((item) => (
          <div
            key={item.id}
            className="
              bg-white rounded-lg shadow p-4 flex flex-col
              transition-all duration-300
              hover:shadow-lg hover:-translate-y-1
              hover:bg-gray-50
            "
          >
            <div className="relative mb-4 overflow-hidden rounded-md">
              <img
                src={item.image}
                alt={item.title}
                className="
                  w-full h-40 object-cover
                  transition-transform duration-300
                  hover:scale-105
                "
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {item.title}
            </h3>
            <p className="text-gray-500 text-sm mb-2">
              Published{' '}
              {new Date(item.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </p>
            <Link
              to={`/news/${item.id}`}
              className="
                mt-auto inline-block
                bg-blue-500 hover:bg-blue-600
                text-white px-4 py-2
                rounded text-sm
                transition-colors duration-300
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            >
              Read More
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
        <button
          onClick={handlePrevPage}
          disabled={page <= 1}
          className="
            px-4 py-2 bg-gray-300 text-gray-700
            rounded disabled:opacity-50 hover:bg-gray-400
            transition-colors duration-200
          "
        >
          Prev
        </button>

        <div className="flex items-center gap-2">
          <span className="text-gray-600">Page:</span>
          <select
            value={page}
            onChange={handlePageChange}
            className="
              p-2 border border-gray-300
              rounded-md focus:outline-none
              focus:ring-2 focus:ring-blue-500
              transition-colors duration-200
            "
          >
            {Array.from({ length: totalPages }, (_, index) => (
              <option key={index} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
          <span className="text-gray-600">of {totalPages}</span>
        </div>

        <button
          onClick={handleNextPage}
          disabled={page >= totalPages}
          className="
            px-4 py-2 bg-gray-300 text-gray-700
            rounded disabled:opacity-50 hover:bg-gray-400
            transition-colors duration-200
          "
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default PublicNewsList;

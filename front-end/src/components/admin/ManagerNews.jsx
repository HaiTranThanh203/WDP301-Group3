import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getListNews } from "../../services/NewsService";
import { message } from "antd";

function ManagerNews() {
  // State cho các bộ lọc và phân trang
  const [searchTitle, setSearchTitle] = useState("");
  const [filterStatus, setFilterStatus] = useState("All"); // Options: All, Active, DeActive
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // State thống kê và phân trang từ API
  const [totalPages, setTotalPages] = useState(0);
  const [totalNews, setTotalNews] = useState(0);
  const [activeNewsCount, setActiveNewsCount] = useState(0);
  const [deactiveNewsCount, setDeactiveNewsCount] = useState(0);

  // Hàm fetch dữ liệu từ API dựa trên các state phụ thuộc
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Nếu filterStatus là 'All', truyền rỗng để API không filter theo isActive
      const isActive = filterStatus === "All" ? "" : filterStatus;
      // Gọi API getListNews với các tham số: page, limit, isActive, title (searchTitle)
      const response = await getListNews(page, limit, isActive, searchTitle);
      // Giả sử API trả về đối tượng:
      // { results, total, totalPages, activeNewsCount, deactiveNewsCount, data: [ ... ] }
      setNews(response.data);
      setTotalPages(response.totalPages);
      setTotalNews(response.total);
      setActiveNewsCount(response.activeNewsCount);
      setDeactiveNewsCount(response.inactiveNewsCount);
    } catch (error) {
      console.error("Error fetching news:", error);
      message.error("Error fetching news");
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterStatus, searchTitle]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleSearchChange = (e) => {
    setSearchTitle(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setPage(1);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">News Management</h1>
          <Link
            to="/admin/create-news"
            className="bg-orange-500 text-white py-2 px-6 rounded-md shadow-md hover:bg-orange-600 text-sm"
          >
            Create News
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col items-center border border-gray-300 rounded-lg p-6">
            <span className="text-lg font-semibold">Total News</span>
            <div className="text-3xl">{totalNews}</div>
          </div>
          <div className="flex flex-col items-center border border-gray-300 rounded-lg p-6">
            <span className="text-lg font-semibold">Active News</span>
            <div className="text-3xl">{activeNewsCount}</div>
          </div>
          <div className="flex flex-col items-center border border-gray-300 rounded-lg p-6">
            <span className="text-lg font-semibold">Deactive News</span>
            <div className="text-3xl">{deactiveNewsCount}</div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <input
            type="text"
            value={searchTitle}
            onChange={handleSearchChange}
            placeholder="Search by title..."
            className="w-full sm:w-1/3 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 sm:mb-0"
          />
          <select
            value={filterStatus}
            onChange={handleStatusFilterChange}
            className="w-full sm:w-1/4 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 sm:mb-0"
          >
            <option value="All">All Status</option>
            <option value="true">Active</option>
            <option value="false">Deactive</option>
          </select>
          <div className="flex items-center">
            <label htmlFor="limit" className="mr-2 font-medium">
              Show
            </label>
            <select
              id="limit"
              value={limit}
              onChange={handleLimitChange}
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
            </select>
          </div>
        </div>

        {/* News Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center text-lg">Loading...</div>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border">STT</th>
                  
                  <th className="p-3 border">Title</th>
                  
                  <th className="p-3 border">Create At</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {news.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-3 border">
                      {(page - 1) * limit + index + 1}
                    </td>
                  
                    <td className="p-3 border">{item.title}</td>
                  
                    <td className="p-3 border">
                      {new Date(item.createdAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="p-3 border">
                      <span
                        className={`px-2 py-1 rounded-md ${
                          item.isActive
                            ? "bg-green-100 text-green-500"
                            : "bg-red-100 text-red-500"
                        }`}
                      >
                        {item.isActive ? "Active" : "Deactive"}
                      </span>
                    </td>

                    <td className="p-3 border">
                      <Link
                        to={`/admin/news-detail/${item.id}`}
                        className="bg-blue-500 text-white py-1 px-3 rounded-md text-sm hover:bg-blue-600"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handlePrevPage}
            disabled={page <= 1}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-400"
          >
            Prev
          </button>
          <span className="text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page >= totalPages}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-400"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManagerNews;

import React, { useState, useEffect, useCallback } from 'react';
import { listReports, getReportStats, updateReport } from '../../services/ReportService';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

const ManagerReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);  // Số lượng báo cáo mỗi trang (5 hoặc 10)
  const [status, setStatus] = useState('');
  const [postType, setPostType] = useState('');
  const [description, setDescription] = useState('');
  const [totalReports, setTotalReports] = useState(0);
  const [processedReports, setProcessedReports] = useState(0);
  const [unprocessedReports, setUnprocessedReports] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();
  // Fetch statistics for the reports
  const fetchStats = useCallback(async () => {
    try {
      const stats = await getReportStats();
      setTotalReports(stats.totalReports);
      setProcessedReports(stats.processedReports);
      setUnprocessedReports(stats.unprocessedReports);
    } catch (error) {
      console.error('Error fetching report stats:', error);
      message.error('Error fetching report stats');
    }
  }, []);

  // Fetch the list of reports with pagination and filters
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listReports(page, limit, status, postType, description);

      if (data) {
        setReports(data.data);
        setTotalPages(data.totalPages);
        setTotalReports(data.total);
      } else {
        message.error('No reports found.');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      message.error('Error fetching reports');
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, postType, description]);

  useEffect(() => {
    fetchStats();
    fetchReports();
  }, [fetchReports, fetchStats]);

  // Handlers for pagination
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  // Handler to change filters dynamically
  const handleSearchChange = (e) => {
    setDescription(e.target.value);
    setPage(1);  // Reset to the first page when search changes
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);  // Reset to the first page when limit changes
  };

  // Handler to update the report status
  const handleUpdateReportStatus = async (reportId, status) => {
    try {
      await updateReport(reportId, { status });
      message.success(`Report status updated to ${status}`);
      fetchReports();  // Refresh the report list after updating
    } catch (error) {
      console.error('Error updating report status:', error);
      message.error('Error updating report status');
    }
  };
  const handleViewDetail = (id) => {
    navigate(`/admin/report/${id}`);
};

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Reports Management</h1>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-xl font-semibold">Total Reports</p>
            <p className="text-4xl mt-2">{totalReports}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-xl font-semibold text-green-600">Processed Reports</p>
            <p className="text-4xl mt-2">{processedReports}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-xl font-semibold text-red-600">Unprocessed Reports</p>
            <p className="text-4xl mt-2">{unprocessedReports}</p>
          </div>
        </div>

        {/* Search & Limit Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <input
            type="text"
            value={description}
            onChange={handleSearchChange}
            placeholder="Search by description"
            className="w-full sm:w-1/2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 sm:mb-0"
          />
          <div>
            <label htmlFor="limit" className="mr-2 font-medium">Show</label>
            <select
              id="limit"
              value={limit}
              onChange={handleLimitChange}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
            </select>
          </div>
        </div>

        {/* Reports Table */}
        {loading ? (
          <div className="text-center text-lg">Loading...</div>
        ) : reports.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report, index) => (
                  <tr key={report._id} className="hover:bg-gray-100">
                    <td className="px-6 py-4 whitespace-nowrap">{(page - 1) * limit + index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.entityType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${report.status === 'Cancel' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(report.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.userId?.username || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetail(report._id)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded"
                      >
                        View Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-lg">No reports available</div>
        )}

        {/* Pagination */}
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
};

export default ManagerReport;

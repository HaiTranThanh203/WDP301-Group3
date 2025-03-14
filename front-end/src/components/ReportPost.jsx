import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import avatarDefault from "../assets/images/avatar2.png"; // Ảnh mặc định nếu không có avatar

const ReportPost = () => {
  const { id: postId } = useParams(); // ✅ Lấy postId từ URL
  const navigate = useNavigate();
  const [selectedReason, setSelectedReason] = useState("");
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Lấy userId từ localStorage
  const storedUser = localStorage.getItem("user");
  const userId = storedUser ? JSON.parse(storedUser).id : null;
  const token = localStorage.getItem("token");

  // ✅ Fetch bài đăng từ API khi mở trang
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:9999/api/v1/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.data) {
          setPost(response.data.data);
        } else {
          toast.error("🚨 Post not found!");
        }
      } catch (error) {
        console.error("❌ Error fetching post:", error.response?.data || error);
        toast.error("🚨 Failed to load post.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, token]);

  // ✅ Gửi báo cáo lên server
  const handleReportPost = async () => {
    if (!selectedReason) {
      toast.error("⚠ Please select a reason for reporting!");
      return;
    }

    try {
      const reportData = {
        userId: userId,
        reportEntityId: postId, // ✅ Gửi postId vào reportEntityId
        entityType: "Post",
        description: selectedReason,
        status: "Waiting",
      };

      console.log("📌 Sending report data:", reportData);

      await axios.post("http://localhost:9999/api/v1/reports/", reportData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("✅ Your report has been sent to admin!");
      navigate("/");
    } catch (error) {
      console.error("❌ Error submitting report:", error.response?.data || error);
      toast.error("🚨 Failed to submit report. Please try again.");
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading post...</p>;
  if (!post) return <p className="text-center text-red-500">🚨 Post not found!</p>;

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col p-6">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
        <h2 className="font-semibold text-lg border-b border-gray-300 pb-2">Submit a report</h2>

        {/* ✅ Hiển thị thông tin bài đăng */}
        <div className="mt-4 flex items-center space-x-2">
          <img
            src={post.userId?.avatar || avatarDefault} // Hiển thị avatar hoặc ảnh mặc định
            alt="User Avatar"
            className="h-12 w-12 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-lg">{post.userId?.username || "Anonymous"}</h3>
            <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <p className="mt-4 text-gray-700">{post.content || "No content available"}</p>

        {/* ✅ Hiển thị ảnh nếu có */}
        {post.media && post.media.length > 0 && (
          <img src={post.media[0]} alt="Post Media" className="mt-4 w-32 h-32 object-cover" />
        )}

        <div className="mt-6">
          <p className="text-sm text-gray-600 border-t border-gray-300 pb-2">
            Thanks for looking out for yourself by reporting things that break the rules.
          </p>

          {/* ✅ Danh sách lý do báo cáo */}
          <div className="mt-4 space-x-2">
            {[
              "Threatening violence",
              "Sharing personal information",
              "Copyright violation",
              "Impersonation",
              "Spam",
              "Minor abuse or sexualization",
              "Hate",
              "Non-consensual intimate media",
            ].map((reason, index) => (
              <button
                key={index}
                className={`py-1 px-4 text-sm rounded-md border border-gray-300 ${
                  selectedReason === reason
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setSelectedReason(reason)}
              >
                {reason}
              </button>
            ))}
          </div>

          {/* ✅ Nút gửi báo cáo */}
          <button
            onClick={handleReportPost}
            type="submit"
            className="mt-4 bg-orange-500 text-white py-2 px-4 rounded-md text-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportPost;

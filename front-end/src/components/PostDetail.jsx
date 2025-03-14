import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaThumbsUp, FaThumbsDown, FaComment, FaPaperPlane, FaShare } from "react-icons/fa";
import avatarDefault from "../assets/images/avatar2.png";

const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyInput, setReplyInput] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({});


  // Lấy user & token từ localStorage
  const token = localStorage.getItem("token") || "";
  const user = JSON.parse(localStorage.getItem("user")) || null;

  useEffect(() => {
    if (!token || !user) {
      setError("You are not logged in!");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        console.log("Fetching post with postId:", postId);

        const postRes = await axios.get(`http://localhost:9999/api/v1/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (postRes.data && postRes.data.data) {
          setPost(postRes.data.data);
        } else {
          setError("Failed to load the post.");
        }

        console.log("Fetching comments...");
        try {
          const commentRes = await axios.get(`http://localhost:9999/api/v1/comments/get-by-post/${postId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const formatNestedComments = (comments) => {
            const commentMap = new Map();
            comments.forEach((comment) => commentMap.set(comment._id, { ...comment, childrens: [] }));

            comments.forEach((comment) => {
              if (comment.parentId && commentMap.has(comment.parentId)) {
                commentMap.get(comment.parentId).childrens.push(comment);
              }
            });

            return Array.from(commentMap.values()).filter(comment => !comment.parentId);
          };

          setComments(formatNestedComments(commentRes.data?.data || []));

        } catch (error) {
          console.warn("No comments found, setting empty list.");
          setComments([]);
        }

      } catch (error) {
        console.error("Error fetching data:", error.response ? error.response.data : error);
        setError("Failed to load data from the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId]);
  const handleReplyComment = async (parentId) => {
    if (!replyInput[parentId]?.trim()) return;

    try {
      const response = await axios.post(
        "http://localhost:9999/api/v1/comments/reply",
        {
          userId: user.id,
          postId,
          parentId,
          content: replyInput[parentId],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        console.log("✅ Reply Comment Success:", response.data.data);

        setComments((prevComments) => {
          const updateComments = (comments) => {
            return comments.map((comment) => {
              if (comment._id === parentId) {
                return {
                  ...comment,
                  childrens: [
                    ...(comment.childrens || []),
                    {
                      ...response.data.data,
                      userId: {
                        _id: user.id,
                        username: user.username,
                        avatar: user.avatar || avatarDefault,
                      },
                    },
                  ],
                };
              } else if (comment.childrens && comment.childrens.length > 0) {
                return { ...comment, childrens: updateComments(comment.childrens) };
              }
              return comment;
            });
          };

          return updateComments(prevComments);
        });

        setReplyInput({ ...replyInput, [parentId]: "" });
        setShowReplyInput({ ...showReplyInput, [parentId]: false });
      }
    } catch (error) {
      console.error("❌ Error replying to comment:", error.response?.data || error);
    }
  };



  const handleVote = async (type) => {
    if (!post || !user) return;

    try {
      console.log(`Voting ${type} for post:`, postId);

      const response = await axios.patch(
        `http://localhost:9999/api/v1/posts/${postId}/vote`,
        { userId: user.id, vote: type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setPost((prevPost) => ({
          ...prevPost,
          upVotes: response.data.data.upVotes,
          downVotes: response.data.data.downVotes,
          votes: response.data.data.votes,
          userId: prevPost.userId // ✅ Giữ nguyên thông tin user
        }));
      }
    } catch (error) {
      console.error(`Error voting ${type}:`, error.response ? error.response.data : error);
    }
  };



  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    if (!user || !user.id) {
      console.error("Error: User ID not found in localStorage.");
      return;
    }

    try {
      console.log("Submitting comment:", { postId, userId: user.id, content: commentInput });

      const response = await axios.post(
        "http://localhost:9999/api/v1/comments",
        {
          postId,
          userId: user.id,
          content: commentInput,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201 && response.data && response.data.data) {
        console.log("Comment successfully posted:", response.data.data);

        setComments((prevComments) => [
          {
            ...response.data.data,
            userId: {
              _id: user.id,
              username: user.username,
              avatar: user.avatar || avatarDefault,
            },
          },
          ...prevComments,
        ]);

        setCommentInput("");
      } else {
        console.error("Unexpected API response:", response);
      }
    } catch (error) {
      console.error("Error posting comment:", error.response ? error.response.data : error);
    }
  };

  const handleVoteComment = async (commentId, type) => {
    if (!user) return;

    try {
      const response = await axios.patch(
        `http://localhost:9999/api/v1/comments/${commentId}/vote`,
        { userId: user.id, vote: type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setComments((prevComments) => {
          const updateVotes = (comments) => {
            return comments.map((comment) => {
              if (comment._id === commentId) {
                return {
                  ...comment,
                  upVotes: response.data.data.upVotes,
                  downVotes: response.data.data.downVotes
                };
              } else if (comment.childrens && comment.childrens.length > 0) {
                return { ...comment, childrens: updateVotes(comment.childrens) };
              }
              return comment;
            });
          };
          return updateVotes(prevComments);
        });
      }
    } catch (error) {
      console.error("❌ Error voting comment:", error.response?.data || error);
    }
  };


  const renderComments = (comments, parentId = null) => {
    return comments
      .filter(comment => comment.parentId === parentId || (!comment.parentId && !parentId))
      .map((comment) => (
        <div key={comment._id} className="ml-4 mt-2 pl-4">
          <div className="flex items-center space-x-2">
            <img src={comment.userId?.avatar || avatarDefault} alt="User Avatar" className="h-8 w-8 rounded-full" />
            <div>
              <h3 className="font-semibold text-sm">{comment.userId?.username || "Anonymous"}</h3>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
          </div>

          {/* ✅ Thêm nút Reply */}
          {/* ✅ Like / Dislike cho comment */}
          <div className="flex items-center space-x-4 mt-2 text-gray-600">
            <button onClick={() => handleVoteComment(comment._id, "like")} className="flex items-center space-x-1">
              <FaThumbsUp className="text-lg" /> <span>{comment.upVotes ?? 0}</span>
            </button>
            <button onClick={() => handleVoteComment(comment._id, "dislike")} className="flex items-center space-x-1">
              <FaThumbsDown className="text-lg" /> <span>{comment.downVotes ?? 0}</span>
            </button>
          </div>

          {/* ✅ Thêm nút Reply */}
          <button
            onClick={() => setShowReplyInput({ ...showReplyInput, [comment._id]: !showReplyInput[comment._id] })}
            className="text-blue-500 text-sm mt-1 flex items-center"
          >
            <FaComment className="mr-1" /> Reply
          </button>


          {/* ✅ Ô nhập Reply */}
          {showReplyInput[comment._id] && (
            <div className="ml-8 mt-2">
              <input
                type="text"
                placeholder="Reply..."
                value={replyInput[comment._id] || ""}
                onChange={(e) => setReplyInput({ ...replyInput, [comment._id]: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={() => handleReplyComment(comment._id)}
                className="bg-blue-500 text-white py-1 px-3 rounded-md text-xs mt-1"
              >
                Send Reply
              </button>
            </div>
          )}

          {/* ✅ Hiển thị các reply dạng cây */}
          {comment.childrens && comment.childrens.length > 0 && (
            <div className="ml-6">{renderComments(comment.childrens, comment._id)}</div>
          )}
        </div>
      ));
  };





  if (loading) return <p className="text-center text-gray-500">Loading post...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {post ? (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-2">
              <img
                src={post.userId && post.userId.avatar ? post.userId.avatar : avatarDefault}
                alt="User Avatar"
                className="h-12 w-12 rounded-full"
              />
              <div>
                <h2 className="font-semibold text-lg">
                  {post.userId && post.userId.username ? post.userId.username : "Anonymous"}
                </h2>
              </div>
            </div>
            <p className="mt-2 text-gray-700">{post.content || "No content available"}</p>

            {/* ✅ Hiển thị ảnh bài đăng (nếu có) */}
            {post.media && post.media.length > 0 && (
              <div className="mt-4">
                {post.media.map((imageUrl, index) => (
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`Post Image ${index + 1}`}
                    className="mt-2 w-full h-auto rounded-lg shadow-md"
                  />
                ))}
              </div>
            )}

            {/* Like, Dislike, Share, Comment Section */}
            <div className="flex items-center space-x-6 mt-4 text-gray-600">
              <button onClick={() => handleVote("like")} className="flex items-center space-x-1">
                <FaThumbsUp className="text-lg" /> <span>{post.upVotes ?? 0}</span>
              </button>
              <button onClick={() => handleVote("dislike")} className="flex items-center space-x-1">
                <FaThumbsDown className="text-lg" /> <span>{post.downVotes ?? 0}</span>
              </button>
              <div className="flex items-center space-x-1">
                <FaComment className="text-lg" /> <span>{comments.length}</span>
              </div>
            </div>
          </div>

          {/* Comment Section */}
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <form onSubmit={handleAddComment} className="flex items-center space-x-2">
              <img src={user.avatar || avatarDefault} alt="User Avatar" className="h-8 w-8 rounded-full" />
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
              <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md">
                <FaPaperPlane />
              </button>
            </form>
            <div className="mt-6">{renderComments(comments)}</div>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">Post does not exist!</p>
      )}
    </div>
  );
};

export default PostDetail;

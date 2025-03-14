import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { uploadImageToSupabase } from "../utils/uploadImageSupabase";
const ManageCommunity = ({ showModal, setShowModal, community }) => {
  const [communityName, setCommunityName] = useState("");
  const [description, setDescription] = useState("");
  const [rule, setRule] = useState("");
  const [logo, setLogo] = useState("");
  const [type, setType] = useState("");
  const [joinRequests, setJoinRequests] = useState([]);
  const token = localStorage.getItem("token");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (community) {
      setCommunityName(community.name || "");
      setLogo(community.logo);
      setType(community.privacyType);
      setDescription(community.description || "");
      setRule(community.communityRule || "");
      setJoinRequests(community.joinRequests || []);
    }
  }, [community]);
  const handleFileChange = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (file) {
      const imageUrl = await uploadImageToSupabase(file, "fpt-image");
      console.log("Uploaded image URL 2:", imageUrl);
      setLogo(imageUrl);
      setSelectedImage(imageUrl);
    }
  };
  const handleAccept = async (id) => {
    try {
      await axios.patch(
        `http://localhost:9999/api/v1/communities/access/${community.id}`,
        { ids: [id] },
        { headers: { "Content-Type": "application/json" } }
      );
      toast.success("User added successfully!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:9999/api/v1/communities/${community.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      window.location.href = "/";
    } catch (error) {
      console.error(error);
    }
    setShowConfirmDelete(false);
  };

  const handleUpdate = async () => {
    try {
      await axios.patch(
        `http://localhost:9999/api/v1/communities/edit/${community.id}`,
        {
          name: communityName,
          description,
          communityRule: rule,
          privacyType: type,
          logo,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Community updated successfully!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {showModal && (
        <div className="min-h-screen inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-semibold">Manage Community</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowModal(false)}
              >
                ✖
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mt-4 border-b pb-2">
              <button
                className={`pb-1 ${
                  activeTab === "details"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("details")}
              >
                Details
              </button>
              <button
                className={`pb-1 ${
                  activeTab === "requests"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("requests")}
              >
                Join Requests
              </button>
              <button
                className={`pb-1 ${
                  activeTab === "logo"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("logo")}
              >
                Logo
              </button>
            </div>

            {/* Details Tab */}
            {activeTab === "details" && (
              <div className="mt-4">
                <label className="block text-gray-700 font-medium mb-1">
                  Community Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border rounded-md p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter community name"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                />

                <label className="block text-gray-700 font-medium mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border rounded-md p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />

                <label className="block text-gray-700 font-medium mb-1">
                  Rules
                </label>
                <textarea
                  className="w-full border rounded-md p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter community rules"
                  value={rule}
                  onChange={(e) => setRule(e.target.value)}
                  rows={3}
                />

                <label className="block text-gray-700 font-medium mb-1">
                  Community Type
                </label>
                <div className="flex space-x-3 mb-3">
                  {["public", "restricted", "private"].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="communityType"
                        value={option}
                        checked={type === option}
                        onChange={(e) => setType(e.target.value)}
                        className="mr-2"
                      />
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </label>
                  ))}
                </div>

                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition w-full"
                  onClick={handleUpdate}
                >
                  Save Changes
                </button>
              </div>
            )}

            {/* Join Requests Tab */}
            {activeTab === "requests" && (
              <div className="mt-4">
                {joinRequests.length > 0 ? (
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">No</th>
                        <th className="border p-2">Reason</th>
                        <th className="border p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {joinRequests.map((request, index) => (
                        <tr key={request?.userId}>
                          <td className="border p-2">{index + 1}</td>
                          <td className="border p-2">{request?.reason}</td>
                          <td className="border p-2">
                            <button
                              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                              onClick={() => handleAccept(request?._id)}
                            >
                              Accept
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center text-gray-500">
                    No join requests available
                  </p>
                )}
              </div>
            )}
            {activeTab === "logo" && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Upload Logo:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-2 p-2 border rounded-lg w-full"
                />
                {selectedImage && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Preview:</p>
                    <img
                      src={selectedImage}
                      alt="Uploaded Logo"
                      className="mt-2 max-w-xs rounded-lg shadow"
                    />
                  </div>
                )}
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition w-full"
                  onClick={handleUpdate}
                >
                  Save
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                onClick={() => setShowConfirmDelete(true)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6">
            <p>Are you sure you want to delete this community?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                onClick={() => setShowConfirmDelete(false)}
              >
                No
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                onClick={handleDelete}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageCommunity;

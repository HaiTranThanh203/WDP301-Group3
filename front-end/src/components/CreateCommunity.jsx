import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CommunityDetails from "./SubCMPNTCreateCommunity/CommunityDetails";
import CommunityType from "./SubCMPNTCreateCommunity/CommunityType";
import { toast } from "react-toastify";
const CreateCommunity = () => {
  const navigate = useNavigate();
  const [communityName, setCommunityName] = useState("");
  const [description, setDescription] = useState("");
  const [banner, setBanner] = useState("");
  const [icon, setIcon] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [communityType, setCommunityType] = useState("public");
  const [isMature, setIsMature] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [rule, setRule] = useState("");
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const [user, setUser] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) setUser(userData);
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowPreview(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const data = JSON.stringify({
      name: communityName,
      description,
      createdBy: user.id,
      moderators: [user.id],
      logo: icon,
      background: banner,
      privacyType: communityType,
      communityRule: rule,
      topics: selectedTopics,
    });

    try {
      const response = await axios.post(
        "http://localhost:9999/api/v1/communities/create",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Community successfully created");
      user?.moderatorCommunities?.push(response?.data.id);
      localStorage.setItem("user", JSON.stringify(user));
      setShowPreview(false);
      navigate("/");
    } catch (error) {
      toast.error("Failed to create community. Please try again.");
    }
  };

  const steps = [
    <CommunityDetails
      communityName={communityName}
      setCommunityName={setCommunityName}
      description={description}
      setDescription={setDescription}
      rule={rule}
      setRule={setRule}
    />,
    <CommunityType
      communityType={communityType}
      setCommunityType={setCommunityType}
      isMature={isMature}
      setIsMature={setIsMature}
    />,
  ];

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center border-b pb-2">
        <h2 className="text-xl font-bold">Create Community</h2>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => navigate("/")}
        >
          ✖
        </button>
      </div>

      <div className="mt-4">{steps[currentStep]}</div>

      <div className="mt-6 flex justify-between">
        <button
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Back
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          onClick={handleNext}
        >
          {currentStep === steps.length - 1 ? "Preview Community" : "Next"}
        </button>
      </div>

      {showPreview && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xl font-bold">Community Preview</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowPreview(false)}
              >
                ✖
              </button>
            </div>

            <div className="mt-4">
              {icon && (
                <img
                  src={icon}
                  alt="Icon"
                  className="w-12 h-12 rounded-full mx-auto mb-2"
                />
              )}
              <h5 className="text-center font-semibold">
                {communityName || "Community Name"}
              </h5>
              {banner && (
                <img
                  src={banner}
                  alt="Banner"
                  className="w-full h-40 object-cover rounded-md mt-2"
                />
              )}
              <p className="text-gray-600 mt-4">{description}</p>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                onClick={() => setShowPreview(false)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                onClick={handleSubmit}
              >
                Create Community
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-center mt-3">{error}</p>}
    </div>
  );
};

export default CreateCommunity;

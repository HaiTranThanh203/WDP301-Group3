import React from "react";

const CommunityType = ({
  communityType,
  setCommunityType,
  isMature,
  setIsMature,
}) => {
  const handleCommunityTypeChange = (e) => {
    setCommunityType(e.target.value);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold">What kind of community is this?</h3>
      <p className="text-gray-600 mt-2">
        Decide who can view and contribute in your community.
      </p>

      <hr className="my-4 border-t border-gray-300" />

      <div className="space-y-3">
        {/* Public */}
        <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-100 transition">
          <input
            type="radio"
            name="communityType"
            value="public"
            checked={communityType === "public"}
            onChange={handleCommunityTypeChange}
            className="mt-1 mr-3"
          />
          <div>
            <strong className="text-gray-900">Public</strong>
            <p className="text-gray-600 text-sm">
              Anyone can view, post, and comment to this community.
            </p>
          </div>
        </label>

        {/* Restricted */}
        <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-100 transition">
          <input
            type="radio"
            name="communityType"
            value="restricted"
            checked={communityType === "restricted"}
            onChange={handleCommunityTypeChange}
            className="mt-1 mr-3"
          />
          <div>
            <strong className="text-gray-900">Restricted</strong>
            <p className="text-gray-600 text-sm">
              Anyone can view, but only approved users can contribute.
            </p>
          </div>
        </label>

        {/* Private */}
        <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-100 transition">
          <input
            type="radio"
            name="communityType"
            value="private"
            checked={communityType === "private"}
            onChange={handleCommunityTypeChange}
            className="mt-1 mr-3"
          />
          <div>
            <strong className="text-gray-900">Private</strong>
            <p className="text-gray-600 text-sm">
              Only approved users can view and contribute.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default CommunityType;

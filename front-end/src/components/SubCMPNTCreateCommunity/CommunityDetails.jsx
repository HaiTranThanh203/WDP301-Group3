import React from "react";

const CommunityDetails = ({
  communityName,
  setCommunityName,
  description,
  setDescription,
  rule,
  setRule,
}) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold">Tell us about your community</h3>
      <p className="text-gray-600 mt-2">
        A name and description help people understand what your community is all
        about.
      </p>

      <hr className="my-4 border-t border-gray-300" />

      {/* Community Name */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">
          Community Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
          placeholder="Enter community name"
          value={communityName}
          required
          onChange={(e) => setCommunityName(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Enter description"
          value={description}
          required
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Rules */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">
          Rule
          <small className="text-red-500 ml-1 text-sm">
            (Each line in the rule will be separated by a period.)
          </small>
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Enter Rule"
          value={rule}
          onChange={(e) => setRule(e.target.value)}
        />
      </div>
    </div>
  );
};

export default CommunityDetails;

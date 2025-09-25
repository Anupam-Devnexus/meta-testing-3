import React from "react";
import { useNavigate } from "react-router-dom";
import Data from "../Datastore/Privacy.json";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          &larr; Back
        </button>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">
          Privacy Policy
        </h1>

        {/* Effective Date */}
        <p className="text-gray-600 mb-6 text-center">
          Effective Date:{" "}
          <span className="font-semibold">
            {Data.privacyPolicy.effectiveDate}
          </span>
        </p>

        {/* Introduction */}
        <p className="text-gray-700 mb-6">{Data.privacyPolicy.introduction}</p>

        {/* Sections */}
        {Data.privacyPolicy.sections.map((section, index) => (
          <div key={index} className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {section.title}
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {section.content.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        ))}

        {/* Footer */}
        <div className="mt-8 text-gray-500 text-sm text-center">
          &copy; {new Date().getFullYear()} {Data.privacyPolicy.company}. All rights
          reserved.
        </div>
      </div>
    </div>
  );
};

export default Privacy;

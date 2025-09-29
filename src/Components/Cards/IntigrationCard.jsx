import React from "react";

const IntegrationCard = ({
  buttonText,
  buttonColor,
  onClick,
  isLoading,
}) => {
  return (
    <div
      className={` flex flex-col justify-between`}
    >


      <button
        onClick={!isLoading ? onClick : undefined}
        disabled={isLoading}
        className={`mt-4 cursor-pointer px-2 w-full py-2 text-white rounded-lg flex items-center justify-center ${buttonColor} ${isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
      >
        {isLoading ? (
          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
        ) : (
          buttonText
        )}
      </button>
    </div>
  );
};

export default IntegrationCard;

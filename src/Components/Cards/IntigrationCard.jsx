import React from "react";

const IntegrationCard = ({
  title = "Integration",
  description = "",
  icon: Icon = null,
  bgColor = "bg-white",
  textColor = "text-gray-800",
  borderColor = "border-gray-200",
  buttonText = "Connect",
  buttonColor = "bg-blue-600",
  buttonTextColor = "text-white",
  onButtonClick = () => {},
}) => {
  return (
    <div
      className={`max-w-sm w-full p-4 rounded-lg shadow-md border ${borderColor} ${bgColor} flex flex-col items-start gap-3`}
    >
      {/* Icon + Title */}
      <div className="flex items-center gap-3 w-full">
        {Icon && <Icon size={30} className={textColor} />}
        <h3 className={`text-lg font-bold ${textColor}`}>{title}</h3>
      </div>

      {/* Description */}
      {description && <p className={`text-sm ${textColor}`}>{description}</p>}

      {/* Button */}
      <button
        onClick={onButtonClick}
        className={`mt-auto px-2 py-1 rounded-md font-medium ${buttonColor} ${buttonTextColor} hover:opacity-90 transition`}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default IntegrationCard;

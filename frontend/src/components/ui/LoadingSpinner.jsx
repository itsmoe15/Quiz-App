// frontend/src/components/ui/LoadingSpinner.jsx
import React from "react";

const LoadingSpinner = ({ size = "md", message = "Loading..." }) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin`}
      ></div>
      {message && <p className="mt-2 text-gray-600">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;

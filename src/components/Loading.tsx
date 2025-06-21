import React from "react";

interface LoadingProps {
  size?: "small" | "medium" | "large";
  text?: string;
  fadeOut?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ size = "medium", text = "", fadeOut = false }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 absolute w-screen h-screen bg-black z-[100]`}> 
      <div className={`animate-spin rounded-full border-4 border-transparent border-t-red-600 ${sizeClasses[size]} animate-pulse`}></div>
      {text && <p className={`mt-2 text-sm text-gray-600 ${fadeOut ? "animate-fade-out-delay" : "animate-fade-in-delay"}`}>{text}</p>}
    </div>
  );
};

export default Loading;

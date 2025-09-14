import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004b87]"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6319] absolute top-0 left-0 animation-delay-150"></div>
      </div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
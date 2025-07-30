import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center bg-theme-surface/95 z-40 backdrop-blur-sm">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-theme-secondary mx-auto mb-4 sm:mb-6"></div>
        <p className="text-theme-primary text-base sm:text-lg font-serif italic font-light px-4">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
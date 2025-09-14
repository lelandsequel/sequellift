import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="bg-red-50 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-800">Error</h3>
            <p className="text-red-600 mt-1">{message}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 flex items-center space-x-2 text-red-700 hover:text-red-800 font-medium"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Try Again</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
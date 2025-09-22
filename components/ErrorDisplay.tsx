import React from 'react';
import { ErrorIcon } from './Icons';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-xl relative flex items-start space-x-3 animate-fade-in" role="alert">
      <div className="flex-shrink-0 pt-0.5">
        <ErrorIcon />
      </div>
      <div>
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline ml-2">{message}</span>
      </div>
    </div>
  );
};
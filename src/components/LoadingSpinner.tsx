
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

const LoadingSpinner = ({ size = 'md', message, className = '' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center space-y-2 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message || 'Carregando conteúdo'}
    >
      <div 
        className={`${sizeClasses[size]} border-4 border-cv-coral border-t-transparent rounded-full animate-spin`}
        aria-hidden="true"
      />
      {message && (
        <p className="text-cv-gray-light text-sm font-medium text-center px-4">
          {message}
        </p>
      )}
      <span className="sr-only">
        {message || 'Carregando, aguarde...'}
      </span>
    </div>
  );
};

export default LoadingSpinner;

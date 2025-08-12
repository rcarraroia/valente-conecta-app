
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Info } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

const ErrorMessage = ({ 
  title, 
  message, 
  type = 'error', 
  onRetry, 
  retryLabel = 'Tentar novamente',
  className = '' 
}: ErrorMessageProps) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" aria-hidden="true" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500 flex-shrink-0" aria-hidden="true" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" aria-hidden="true" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'warning':
        return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return 'border-red-200 bg-red-50 text-red-800';
    }
  };

  return (
    <Card 
      className={`${getColorClasses()} mx-4 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1 space-y-2 min-w-0">
            {title && (
              <h3 className="font-semibold text-sm">
                {title}
              </h3>
            )}
            <p className="text-sm leading-relaxed break-words">
              {message}
            </p>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="mt-3 w-full sm:w-auto"
                aria-label={retryLabel}
              >
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                {retryLabel}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorMessage;


import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  onError?: () => void;
}

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height, 
  placeholder,
  onError 
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Função para otimizar URLs do Unsplash
  const getOptimizedUrl = (url: string, w?: number, h?: number) => {
    if (url.includes('unsplash.com')) {
      const params = new URLSearchParams();
      if (w) params.append('w', w.toString());
      if (h) params.append('h', h.toString());
      params.append('fit', 'crop');
      params.append('q', '80');
      
      return `${url}?${params.toString()}`;
    }
    return url;
  };

  const optimizedSrc = getOptimizedUrl(src, width, height);

  if (hasError) {
    return (
      <div 
        className={`bg-cv-gray-light/20 flex items-center justify-center ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={`Erro ao carregar imagem: ${alt}`}
      >
        <span className="text-cv-gray-light text-sm text-center p-2">
          Imagem não disponível
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div 
          className={`absolute inset-0 flex items-center justify-center bg-cv-gray-light/10 ${className}`}
          style={{ width, height }}
        >
          <LoadingSpinner size="sm" />
        </div>
      )}
      <img
        src={optimizedSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};

export default OptimizedImage;

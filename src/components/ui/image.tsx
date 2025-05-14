'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface ImageWithLoadingProps
  extends Omit<ImageProps, 'onError' | 'onLoadingComplete'> {
  fallbackText?: string;
}

export function ImageWithLoading({
  alt,
  className,
  fallbackText = 'Image not available',
  ...props
}: ImageWithLoadingProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
        <span>{fallbackText}</span>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <Image
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        {...props}
      />
    </>
  );
}

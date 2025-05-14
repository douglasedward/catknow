import React from 'react';
import Link from 'next/link';
import type { Cat } from '@/types';
import { cn } from '@/lib/utils';
import { ImageWithLoading } from './ui/image';

interface CatCardProps {
  cat: Cat;
  className?: string;
}

const CatCard = React.memo(({ cat, className }: CatCardProps) => {
  const catName = cat.breeds?.[0]?.name ?? 'Cat';
  const catTemperament = cat.breeds?.[0]?.temperament ?? 'Lovely cat';

  return (
    <Link
      href={`/cat/${cat.id}`}
      className={cn(
        'block transform transition-transform focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-gray-500',
        className
      )}
      aria-label={`View details for ${catName}`}
    >
      <article className="border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="relative h-60 hover:scale-105 transition-transform duration-300">
          <ImageWithLoading
            src={cat.url}
            alt={`Photo of ${catName}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
            priority
            fallbackText="Unable to load cat image"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg truncate">{catName}</h3>
          <p
            className="text-sm text-gray-600 mt-1 truncate"
            title={catTemperament}
          >
            {catTemperament}
          </p>
        </div>
      </article>
    </Link>
  );
});

CatCard.displayName = 'CatCard';

export default CatCard;

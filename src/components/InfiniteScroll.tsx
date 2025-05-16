'use client';
import { useEffect, useRef, memo } from 'react';
import type { Cat } from '@/types';
import { useCatService } from '@/app/providers';
import CatCard from './CatCard';
import List from './List';
import { cn } from '@/lib/utils';
import { useInfiniteData } from '@/hooks/useInfiniteData';

interface InfiniteScrollProps {
  initialItems: Cat[];
  initialPage: number;
  filters: string;
  limit: number;
  renderItem?: (item: Cat) => React.ReactNode;
  className?: string;
}

const LoadingIndicator = () => (
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-xl" />
    ))}
  </div>
);

const ErrorMessage = ({
  message,
  onRetry
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className="flex flex-col items-center justify-center p-4 text-gray-500">
    <p className="mb-2">{message}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 text-sm text-white bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
      aria-label="Retry loading items"
    >
      Try Again
    </button>
  </div>
);

const InfiniteScroll = ({
  initialItems,
  initialPage,
  filters,
  limit,
  renderItem = (cat: Cat) => <CatCard cat={cat} />,
  className
}: InfiniteScrollProps) => {
  const catService = useCatService();
  const observerTarget = useRef<HTMLDivElement>(null);

  const { items, error, isFetchingNext, hasNextPage, fetchNextPage, refetch } =
    useInfiniteData({
      initialItems,
      initialPage,
      limit,
      key: filters,
      fetchFn: (page: number) => catService.getCats(page, limit, filters)
    });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNext) {
          fetchNextPage();
        }
      },
      {
        rootMargin: '200px'
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNext]);

  if (error) {
    return <ErrorMessage message={error.message} onRetry={refetch} />;
  }

  return (
    <div className={cn('space-y-4', className)}>
      <List items={items} renderItem={renderItem} aria-label="List of cats" />

      <div ref={observerTarget} />

      {isFetchingNext && <LoadingIndicator />}
    </div>
  );
};

export default memo(InfiniteScroll);

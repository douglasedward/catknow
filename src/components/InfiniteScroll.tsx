'use client';
import { useEffect, useRef, memo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { Cat } from '@/types';
import { useCatService } from '@/app/providers';
import CatCard from './CatCard';
import List from './List';
import { cn } from '@/lib/utils';

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

const FIVE_MINUTES = 1000 * 60 * 5;

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
  const prevFiltersRef = useRef(filters);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
    isError,
    refetch
  } = useInfiniteQuery({
    queryKey: ['cats', filters],
    initialPageParam: initialPage,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < limit) return undefined;
      return allPages.length;
    },
    queryFn: async ({ pageParam = initialPage }) => {
      return catService.getCats(pageParam, limit, filters);
    },
    initialData: {
      pages: [initialItems],
      pageParams: [initialPage]
    },
    staleTime: FIVE_MINUTES
  });

  useEffect(() => {
    if (prevFiltersRef.current !== filters) {
      window.scrollTo(0, 0);
      prevFiltersRef.current = filters;
    }
  }, [filters]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
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
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const items = data?.pages.flat() ?? [];

  if (isError) {
    return (
      <ErrorMessage
        message={
          error instanceof Error ? error.message : 'Failed to load items'
        }
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <List items={items} renderItem={renderItem} aria-label="List of cats" />

      <div ref={observerTarget} />

      {isFetchingNextPage && <LoadingIndicator />}
    </div>
  );
};

export default memo(InfiniteScroll);

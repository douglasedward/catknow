import { useCallback, useEffect, useRef, useState } from 'react';

interface InfiniteDataState<T> {
  items: T[];
  error: Error | null;
  isLoading: boolean;
  isFetchingNext: boolean;
  hasNextPage: boolean;
}

interface UseInfiniteDataOptions<T> {
  initialItems: T[];
  initialPage: number;
  fetchFn: (page: number) => Promise<T[]>;
  limit: number;
  key?: string;
}

export function useInfiniteData<T>({
  initialItems,
  initialPage,
  fetchFn,
  limit,
  key = ''
}: UseInfiniteDataOptions<T>) {
  const [state, setState] = useState<InfiniteDataState<T>>({
    items: initialItems,
    error: null,
    isLoading: false,
    isFetchingNext: false,
    hasNextPage: initialItems.length >= limit
  });

  const currentPage = useRef(initialPage);
  const prevKey = useRef(key);

  const fetchNextPage = useCallback(async () => {
    if (!state.hasNextPage || state.isFetchingNext) return;

    setState((prev) => ({ ...prev, isFetchingNext: true }));

    try {
      const nextPage = currentPage.current + 1;
      const newItems = await fetchFn(nextPage);

      setState((prev) => ({
        ...prev,
        items: [...prev.items, ...newItems],
        hasNextPage: newItems.length >= limit,
        isFetchingNext: false,
        error: null
      }));

      currentPage.current = nextPage;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error : new Error('Failed to fetch data'),
        isFetchingNext: false
      }));
    }
  }, [fetchFn, limit, state.hasNextPage, state.isFetchingNext]);

  const refetch = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    currentPage.current = initialPage;

    try {
      const items = await fetchFn(initialPage);

      setState({
        items,
        error: null,
        isLoading: false,
        isFetchingNext: false,
        hasNextPage: items.length >= limit
      });
    } catch (error) {
      setState({
        items: [],
        error:
          error instanceof Error ? error : new Error('Failed to fetch data'),
        isLoading: false,
        isFetchingNext: false,
        hasNextPage: false
      });
    }
  }, [fetchFn, initialPage, limit]);

  useEffect(() => {
    if (prevKey.current !== key) {
      prevKey.current = key;
      refetch();
    }
  }, [key, refetch]);

  return {
    ...state,
    fetchNextPage,
    refetch
  };
}

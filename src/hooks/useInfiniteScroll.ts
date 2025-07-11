import { useCallback, useRef, useEffect } from 'react';

export function useInfiniteScroll(onLoadMore: () => void, hasMore: boolean) {
  const observer = useRef<IntersectionObserver | null>(null);

  const loadMoreRef = useCallback(
    (node?: Element | null) => {
      if (!node) return;

      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });

      observer.current.observe(node);
    },
    [onLoadMore, hasMore]
  );

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return { loadMoreRef };
} 
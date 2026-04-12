import { useState, useCallback, useRef } from "react";
import type { PaginatedResponse } from "../types";

interface Options<T> {
  fetcher: (cursor?: string) => Promise<PaginatedResponse<T>>;
}

export function useInfiniteScroll<T>({ fetcher }: Options<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cursorRef = useRef<string | undefined>(undefined);
  const fetchingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (fetchingRef.current || !hasMore) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher(cursorRef.current);
      setItems((prev) => [...prev, ...res.items]);
      cursorRef.current = res.next_cursor ?? undefined;
      setHasMore(res.has_more);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [fetcher, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setHasMore(true);
    setError(null);
    cursorRef.current = undefined;
    fetchingRef.current = false;
  }, []);

  return { items, loading, hasMore, error, loadMore, reset };
}

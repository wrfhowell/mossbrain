import { useState, useCallback, useRef } from "react";
import type { PaginatedResponse } from "../types";

interface Options<T extends { id: string }> {
  fetcher: (cursor?: string) => Promise<PaginatedResponse<T>>;
}

export function useInfiniteScroll<T extends { id: string }>({
  fetcher,
}: Options<T>) {
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
      setItems((prev) => {
        const seen = new Set(prev.map((i) => i.id));
        const fresh = res.items.filter((i) => !seen.has(i.id));
        return [...prev, ...fresh];
      });
      cursorRef.current = res.next_cursor ?? undefined;
      setHasMore(res.has_more);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [fetcher, hasMore]);

  return { items, loading, hasMore, error, loadMore };
}

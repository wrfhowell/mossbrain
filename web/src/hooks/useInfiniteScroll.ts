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
  const genRef = useRef(0);

  const loadMore = useCallback(async () => {
    if (fetchingRef.current || !hasMore) return;
    fetchingRef.current = true;
    const gen = genRef.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher(cursorRef.current);
      if (gen !== genRef.current) return;
      setItems((prev) => {
        const seen = new Set(prev.map((i) => i.id));
        const fresh = res.items.filter((i) => !seen.has(i.id));
        return [...prev, ...fresh];
      });
      cursorRef.current = res.next_cursor ?? undefined;
      setHasMore(res.has_more);
    } catch (e) {
      if (gen !== genRef.current) return;
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      if (gen === genRef.current) {
        setLoading(false);
        fetchingRef.current = false;
      }
    }
  }, [fetcher, hasMore]);

  const reset = useCallback(() => {
    genRef.current++;
    setItems([]);
    setHasMore(true);
    setError(null);
    cursorRef.current = undefined;
    fetchingRef.current = false;
  }, []);

  return { items, loading, hasMore, error, loadMore, reset };
}

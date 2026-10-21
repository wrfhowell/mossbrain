import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import MonthRail from "../components/MonthRail";
import PhotoGraph from "../components/PhotoGraph";
import Thought from "../components/Thought";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { fetchEntries } from "../lib/api";
import type { Entry } from "../types";

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function groupByMonth(entries: Entry[]) {
  const groups: { key: string; entries: Entry[] }[] = [];
  for (const e of entries) {
    const key = monthKey(e.published_at);
    const last = groups[groups.length - 1];
    if (last?.key === key) last.entries.push(e);
    else groups.push({ key, entries: [e] });
  }
  return groups;
}

export default function ThoughtsPage() {
  const [params, setParams] = useSearchParams();
  const highlightId = params.get("highlight");
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  const fetcher = useCallback((cursor?: string) => fetchEntries(cursor), []);
  const { items, loading, hasMore, loadMore, error } = useInfiniteScroll<Entry>({ fetcher });

  // Load everything so the month rail maps the whole archive
  useEffect(() => {
    if (hasMore && !loading && !error) loadMore();
  }, [hasMore, loading, error, loadMore]);

  // Graph node click -> scroll to that thought
  useEffect(() => {
    if (!highlightId) return;
    if (items.some((e) => String(e.id) === highlightId)) {
      setActiveHighlight(highlightId);
      setParams(
        (prev) => {
          prev.delete("highlight");
          return prev;
        },
        { replace: true },
      );
    }
  }, [highlightId, items, setParams]);

  const clearHighlight = useCallback(() => setActiveHighlight(null), []);
  const groups = useMemo(() => groupByMonth(items), [items]);

  return (
    <>
      <main className="max-w-[720px] px-4 pt-8 pb-32">
        <p>
          <Link to="/">← home</Link>
        </p>

        <div className="mt-6" />
        {items.length === 0 && loading && <p className="text-faint">loading…</p>}
        {error && <p className="text-accent">couldn't load thoughts.</p>}

        {groups.map((g) => (
          <section key={g.key} id={`month-${g.key}`} className="scroll-mt-6">
            {g.entries.map((e) => (
              <Thought
                key={e.id}
                entry={e}
                highlighted={String(e.id) === activeHighlight}
                onHighlightSeen={clearHighlight}
              />
            ))}
          </section>
        ))}

      </main>

      <MonthRail groups={groups.map((g) => ({ key: g.key, count: g.entries.length }))} />

      <div className="hidden lg:block fixed right-3 bottom-3 z-20 w-[220px] h-[180px]">
        <PhotoGraph />
      </div>
    </>
  );
}

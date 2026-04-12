import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { fetchEntries } from "../lib/api";
import type { Entry } from "../types";
import EntryCard from "./Entry";
import Logo from "./Logo";

interface Props {
  label?: string;
  onLabelsChange?: (labels: string[]) => void;
}

function relativeDay(dateKey: string): string {
  const now = new Date();
  const then = new Date(dateKey + "T12:00:00");
  const diff = Math.floor(
    (now.setHours(12, 0, 0, 0) - then.getTime()) / 86_400_000,
  );
  if (diff === 0) return "today";
  if (diff === 1) return "yesterday";
  return `${diff}d ago`;
}

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function groupByDate(entries: Entry[]) {
  const groups: {
    key: string;
    label: string;
    relative: string;
    entries: Entry[];
  }[] = [];
  for (const entry of entries) {
    const d = new Date(entry.published_at);
    const key = localDateKey(d);
    const label = d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const last = groups[groups.length - 1];
    if (last?.key === key) {
      last.entries.push(entry);
    } else {
      groups.push({ key, label, relative: relativeDay(key), entries: [entry] });
    }
  }
  return groups;
}

function InitialLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <Logo float floatSpeed="1.4s" size={56} />
    </div>
  );
}

export default function Feed({ label, onLabelsChange }: Props) {
  const [, setParams] = useSearchParams();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetcher = useCallback(
    (cursor?: string) => fetchEntries(cursor, label),
    [label],
  );

  const { items, loading, hasMore, loadMore, reset, error } =
    useInfiniteScroll<Entry>({ fetcher });

  useEffect(() => {
    reset();
  }, [label, reset]);

  useEffect(() => {
    if (items.length === 0 && hasMore) loadMore();
  }, [items.length, hasMore, loadMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && hasMore && !loading) loadMore();
      },
      { rootMargin: "400px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading, loadMore]);

  const allLabels = useMemo(() => {
    const set = new Set<string>();
    items.forEach((e) => e.labels.forEach((l) => set.add(l)));
    return Array.from(set).sort();
  }, [items]);

  useEffect(() => {
    if (allLabels.length > 0) onLabelsChange?.(allLabels);
  }, [allLabels, onLabelsChange]);

  const groups = groupByDate(items);

  return (
    <div>
      {/* Section label */}
      <div className="flex items-center gap-2 text-[10px] tracking-[2px] uppercase text-faint mb-4">
        logs
        <span className="flex-1 h-px bg-border" />
      </div>

      {label && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-[9px] tracking-[1.5px] uppercase px-1.5 py-0.5 rounded-sm bg-tag text-muted">
            #{label}
          </span>
          <button
            onClick={() => setParams({})}
            className="text-[10px] text-faint hover:text-muted tracking-wider cursor-pointer"
          >
            × clear
          </button>
        </div>
      )}

      {items.length === 0 && loading && <InitialLoader />}

      {groups.map((g) => (
        <section key={g.key} className="mb-10">
          <h2 className="text-[17px] font-bold text-ink tracking-wide uppercase mb-4">
            {g.label}
          </h2>
          {g.entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} relative={g.relative} />
          ))}
        </section>
      ))}

      <div ref={sentinelRef} className="h-px" />

      {loading && items.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="text-[10px] text-faint tracking-widest">
            loading...
          </div>
        </div>
      )}

      {error && (
        <p className="text-center text-[11px] text-accent py-4">
          failed to load entries.
        </p>
      )}

      {!hasMore && items.length > 0 && (
        <p className="text-center text-[10px] text-faint py-8 tracking-widest">
          — end —
        </p>
      )}
    </div>
  );
}

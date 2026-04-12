import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { fetchEntries } from "../lib/api";
import EntryCard from "./Entry";
import Logo from "./Logo";
function groupByDate(entries) {
    const groups = [];
    for (const entry of entries) {
        const d = new Date(entry.published_at);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
        const last = groups[groups.length - 1];
        if (last?.key === key) {
            last.entries.push(entry);
        }
        else {
            groups.push({ key, label, entries: [entry] });
        }
    }
    return groups;
}
function InitialLoader() {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center py-16 gap-4", children: [_jsx(Logo, { float: true, size: 56, className: "opacity-50" }), _jsx("span", { className: "text-[10px] text-faint tracking-[3px] uppercase", children: "loading transmissions" })] }));
}
export default function Feed({ label, onLabelsChange }) {
    const [, setParams] = useSearchParams();
    const sentinelRef = useRef(null);
    const fetcher = useCallback((cursor) => fetchEntries(cursor, label), [label]);
    const { items, loading, hasMore, loadMore, reset, error } = useInfiniteScroll({ fetcher });
    useEffect(() => {
        reset();
    }, [label, reset]);
    useEffect(() => {
        if (items.length === 0 && hasMore)
            loadMore();
    }, [items.length, hasMore, loadMore]);
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el)
            return;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && hasMore && !loading)
                loadMore();
        }, { rootMargin: "400px" });
        obs.observe(el);
        return () => obs.disconnect();
    }, [hasMore, loading, loadMore]);
    const allLabels = useMemo(() => {
        const set = new Set();
        items.forEach((e) => e.labels.forEach((l) => set.add(l)));
        return Array.from(set).sort();
    }, [items]);
    useEffect(() => {
        onLabelsChange?.(allLabels);
    }, [allLabels, onLabelsChange]);
    const groups = groupByDate(items);
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 text-[10px] tracking-[2px] uppercase text-faint mb-4", children: ["logs", _jsx("span", { className: "flex-1 h-px bg-border" })] }), label && (_jsxs("div", { className: "mb-4 flex items-center gap-2", children: [_jsxs("span", { className: "text-[9px] tracking-[1.5px] uppercase px-1.5 py-0.5 rounded-sm bg-tag text-muted", children: ["#", label] }), _jsx("button", { onClick: () => setParams({}), className: "text-[10px] text-faint hover:text-muted tracking-wider cursor-pointer", children: "\u00D7 clear" })] })), items.length === 0 && loading && _jsx(InitialLoader, {}), groups.map((g) => (_jsx("section", { children: g.entries.map((entry) => (_jsx(EntryCard, { entry: entry }, entry.id))) }, g.key))), _jsx("div", { ref: sentinelRef, className: "h-px" }), loading && items.length > 0 && (_jsx("div", { className: "flex justify-center py-6", children: _jsx("div", { className: "text-[10px] text-faint tracking-widest", children: "loading..." }) })), error && (_jsx("p", { className: "text-center text-[11px] text-accent py-4", children: "failed to load entries." })), !hasMore && items.length > 0 && (_jsx("p", { className: "text-center text-[10px] text-faint py-8 tracking-widest", children: "\u2014 end of transmissions \u2014" }))] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
import Lightbox from "./Lightbox";
const TAG_COLORS = {
    climbing: "text-accent",
    film: "text-teal",
    reading: "text-gold",
    health: "text-green",
    trail: "text-green",
    extreme: "text-accent",
    thoughts: "text-purple",
    finds: "text-gold",
};
function formatTime(iso) {
    const d = new Date(iso);
    const mon = d.toLocaleDateString("en-US", { month: "short" }).toLowerCase();
    const day = String(d.getDate()).padStart(2, "0");
    const hr = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${mon} ${day} / ${hr}:${min}`;
}
function renderBody(text) {
    return text.split("\n").map((line, i) => {
        const parts = [];
        let cursor = 0;
        const regex = /\*\*(.+?)\*\*/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
            if (match.index > cursor)
                parts.push(line.slice(cursor, match.index));
            parts.push(_jsx("strong", { className: "font-medium text-ink", children: match[1] }, `${i}-${match.index}`));
            cursor = match.index + match[0].length;
        }
        if (cursor < line.length)
            parts.push(line.slice(cursor));
        return (_jsxs("span", { children: [i > 0 && _jsx("br", {}), parts.length ? parts : line] }, i));
    });
}
export default function EntryCard({ entry, prominent }) {
    const [lightboxIdx, setLightboxIdx] = useState(null);
    const hasPhoto = entry.media.length > 0;
    const isPrivate = entry.visibility === "private" && entry.body === null;
    const primaryLabel = entry.labels[0];
    const tagColor = primaryLabel ? (TAG_COLORS[primaryLabel] ?? "text-muted") : "text-muted";
    return (_jsxs("article", { id: `entry-${entry.id}`, className: `
        group relative py-4 border-b border-border scroll-mt-4 transition-all duration-200
        ${hasPhoto ? "cursor-pointer" : ""}
        ${hasPhoto ? "hover:bg-surface-2 hover:-mx-2 hover:px-2 hover:rounded" : ""}
        ${prominent ? "py-6" : ""}
      `, onClick: hasPhoto ? () => setLightboxIdx(0) : undefined, children: [hasPhoto && (_jsx("span", { className: "absolute top-4 right-0 text-[9px] text-faint tracking-widest opacity-0 group-hover:opacity-100 transition-opacity", children: "[ photo ]" })), _jsxs("div", { className: "flex justify-between items-center mb-1.5", children: [_jsx("time", { dateTime: entry.published_at, title: new Date(entry.published_at).toLocaleString(), className: "text-[10px] text-faint tracking-widest", children: formatTime(entry.published_at) }), primaryLabel && (_jsx("span", { className: `text-[9px] tracking-[1.5px] uppercase px-1.5 py-0.5 rounded-sm bg-tag ${tagColor}`, children: primaryLabel }))] }), isPrivate ? (_jsxs("p", { className: "text-faint italic flex items-center gap-1.5 text-[12px]", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", className: "w-3 h-3", children: _jsx("path", { fillRule: "evenodd", d: "M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z", clipRule: "evenodd" }) }), "private transmission"] })) : entry.body ? (_jsx("div", { className: `text-ink leading-[1.75] font-light ${prominent ? "text-[13px]" : "text-[12.5px]"}`, children: renderBody(entry.body) })) : null, hasPhoto && (_jsx("div", { className: "flex gap-2 mt-3 overflow-x-auto", onClick: (e) => e.stopPropagation(), children: entry.media.map((m, i) => (_jsx("button", { onClick: () => setLightboxIdx(i), className: "shrink-0 rounded-sm overflow-hidden border border-border hover:border-border-light transition-colors cursor-pointer", children: _jsx("img", { src: m.url, alt: "", loading: "lazy", className: `object-cover ${prominent ? "h-40 w-40" : "h-24 w-24"}` }) }, m.id))) })), entry.labels.length > 1 && (_jsx("div", { className: "flex gap-1.5 mt-2 flex-wrap", onClick: (e) => e.stopPropagation(), children: entry.labels.slice(1).map((l) => (_jsxs(Link, { to: `/?label=${encodeURIComponent(l)}`, className: `text-[9px] tracking-[1px] uppercase px-1.5 py-0.5 rounded-sm bg-tag ${TAG_COLORS[l] ?? "text-muted"} hover:bg-surface-3 transition-colors`, children: ["#", l] }, l))) })), lightboxIdx !== null && (_jsx(Lightbox, { media: entry.media, index: lightboxIdx, onClose: () => setLightboxIdx(null), onChange: setLightboxIdx }))] }));
}

import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Entry as EntryT } from "../types";
import Lightbox from "./Lightbox";

const TAG_COLORS: Record<string, string> = {
  climbing: "text-accent",
  film: "text-teal",
  reading: "text-gold",
  health: "text-green",
  trail: "text-green",
  extreme: "text-accent",
  thoughts: "text-purple",
  finds: "text-gold",
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .toLowerCase();
}

function renderBody(text: string): ReactNode[] {
  return text.split("\n").map((line, i) => {
    const parts: ReactNode[] = [];
    let cursor = 0;
    const regex = /\*\*(.+?)\*\*/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > cursor) parts.push(line.slice(cursor, match.index));
      parts.push(
        <strong key={`${i}-${match.index}`} className="font-medium text-ink">
          {match[1]}
        </strong>
      );
      cursor = match.index + match[0].length;
    }
    if (cursor < line.length) parts.push(line.slice(cursor));
    return (
      <span key={i}>
        {i > 0 && <br />}
        {parts.length ? parts : line}
      </span>
    );
  });
}

interface Props {
  entry: EntryT;
  prominent?: boolean;
  relative?: string;
}

export default function EntryCard({ entry, prominent, relative }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const hasPhoto = entry.media.length > 0;
  const isPrivate = entry.visibility === "private" && entry.body === null;
  const primaryLabel = entry.labels[0];
  const tagColor = primaryLabel ? (TAG_COLORS[primaryLabel] ?? "text-muted") : "text-muted";

  return (
    <article
      id={`entry-${entry.id}`}
      className={`
        group relative grid grid-cols-[80px_1fr] gap-x-4 py-5 scroll-mt-4 transition-all duration-200
        ${hasPhoto ? "cursor-pointer" : ""}
        ${hasPhoto ? "hover:bg-surface-2 hover:-mx-2 hover:px-2 hover:rounded" : ""}
        ${prominent ? "py-7" : ""}
      `}
      onClick={hasPhoto ? () => setLightboxIdx(0) : undefined}
    >
      {/* Left: metadata column */}
      <div className="flex flex-col gap-0.5 pt-0.5">
        {relative && (
          <span className="text-[11px] text-faint tracking-wide">{relative}</span>
        )}
        <time
          dateTime={entry.published_at}
          title={new Date(entry.published_at).toLocaleString()}
          className="text-[11px] text-faint tracking-wide"
        >
          {formatTime(entry.published_at)}
        </time>
        <span className="text-[11px] text-teal font-mono">{entry.entry_number}</span>
      </div>

      {/* Right: body + media + labels */}
      <div className="min-w-0 flex gap-3">
        <div className="flex-1 min-w-0">
          {primaryLabel && (
            <span className={`text-[9px] tracking-[1.5px] uppercase px-1.5 py-0.5 rounded-sm bg-tag ${tagColor} float-right ml-2`}>
              {primaryLabel}
            </span>
          )}

          {isPrivate ? (
            <div className="inline-flex items-center gap-1.5 text-[11px] text-faint italic bg-surface-2 border border-border rounded px-2.5 py-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
              private entry
            </div>
          ) : entry.body ? (
            <div className={`text-ink leading-[1.75] font-light ${prominent ? "text-[12px]" : "text-[11.5px]"}`}>
              {renderBody(entry.body)}
            </div>
          ) : null}

          {entry.labels.length > 1 && (
            <div className="flex gap-1.5 mt-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
              {entry.labels.slice(1).map((l) => (
                <Link
                  key={l}
                  to={`/?label=${encodeURIComponent(l)}`}
                  className={`text-[9px] tracking-[1px] uppercase px-1.5 py-0.5 rounded-sm bg-tag ${TAG_COLORS[l] ?? "text-muted"} hover:bg-surface-3 transition-colors`}
                >
                  #{l}
                </Link>
              ))}
            </div>
          )}
        </div>

        {hasPhoto && (
          <div className="flex gap-1.5 shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
            {entry.media.map((m, i) => (
              <button
                key={m.id}
                onClick={() => setLightboxIdx(i)}
                className={`shrink-0 rounded-md overflow-hidden border border-border hover:border-border-light transition-colors cursor-pointer ${prominent ? "h-12 w-12" : "h-9 w-9"}`}
              >
                <img
                  src={m.url}
                  alt=""
                  loading="lazy"
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxIdx !== null && (
        <Lightbox
          media={entry.media}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onChange={setLightboxIdx}
        />
      )}
    </article>
  );
}

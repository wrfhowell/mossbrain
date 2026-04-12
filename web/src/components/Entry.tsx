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
  const mon = d.toLocaleDateString("en-US", { month: "short" }).toLowerCase();
  const day = String(d.getDate()).padStart(2, "0");
  const hr = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${mon} ${day} / ${hr}:${min}`;
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
}

export default function EntryCard({ entry, prominent }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const hasPhoto = entry.media.length > 0;
  const isPrivate = entry.visibility === "private" && entry.body === null;
  const primaryLabel = entry.labels[0];
  const tagColor = primaryLabel ? (TAG_COLORS[primaryLabel] ?? "text-muted") : "text-muted";

  return (
    <article
      id={`entry-${entry.id}`}
      className={`
        group relative py-4 border-b border-border scroll-mt-4 transition-all duration-200
        ${hasPhoto ? "cursor-pointer" : ""}
        ${hasPhoto ? "hover:bg-surface-2 hover:-mx-2 hover:px-2 hover:rounded" : ""}
        ${prominent ? "py-6" : ""}
      `}
      onClick={hasPhoto ? () => setLightboxIdx(0) : undefined}
    >
      {/* [photo] indicator */}
      {hasPhoto && (
        <span className="absolute top-4 right-0 text-[9px] text-faint tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          [ photo ]
        </span>
      )}

      {/* Head: time + tag */}
      <div className="flex justify-between items-center mb-1.5">
        <time
          dateTime={entry.published_at}
          title={new Date(entry.published_at).toLocaleString()}
          className="text-[10px] text-faint tracking-widest"
        >
          {formatTime(entry.published_at)}
        </time>
        {primaryLabel && (
          <span className={`text-[9px] tracking-[1.5px] uppercase px-1.5 py-0.5 rounded-sm bg-tag ${tagColor}`}>
            {primaryLabel}
          </span>
        )}
      </div>

      {/* Body */}
      {isPrivate ? (
        <p className="text-faint italic flex items-center gap-1.5 text-[12px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
          private transmission
        </p>
      ) : entry.body ? (
        <div className={`text-ink leading-[1.75] font-light ${prominent ? "text-[13px]" : "text-[12.5px]"}`}>
          {renderBody(entry.body)}
        </div>
      ) : null}

      {/* Media thumbnails */}
      {hasPhoto && (
        <div className="flex gap-2 mt-3 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
          {entry.media.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setLightboxIdx(i)}
              className="shrink-0 rounded-sm overflow-hidden border border-border hover:border-border-light transition-colors cursor-pointer"
            >
              <img
                src={m.url}
                alt=""
                loading="lazy"
                className={`object-cover ${prominent ? "h-40 w-40" : "h-24 w-24"}`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Labels (if more than one) */}
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

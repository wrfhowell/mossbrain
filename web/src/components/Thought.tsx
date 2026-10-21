import { type ReactNode, useEffect, useRef } from "react";
import type { Entry } from "../types";

function formatDate(d: Date): string {
  return `${d.getMonth() + 1}.${d.getDate()}.${String(d.getFullYear()).slice(2)}`;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
}

function renderBody(text: string): ReactNode[] {
  return text.split("\n").map((line, i) => {
    const parts: ReactNode[] = [];
    let cursor = 0;
    const regex = /\*\*(.+?)\*\*|(https?:\/\/\S+)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > cursor) parts.push(line.slice(cursor, match.index));
      const key = `${i}-${match.index}`;
      parts.push(
        match[2] ? (
          <a key={key} href={match[2]} target="_blank" rel="noreferrer">
            {match[2]}
          </a>
        ) : (
          <b key={key}>{match[1]}</b>
        ),
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
  entry: Entry;
  highlighted?: boolean;
  onHighlightSeen?: () => void;
}

export default function Thought({ entry, highlighted, onHighlightSeen }: Props) {
  const ref = useRef<HTMLElement>(null);
  const d = new Date(entry.published_at);
  const isPrivate = entry.visibility === "private" && entry.body === null;

  useEffect(() => {
    if (!highlighted || !ref.current) return;
    ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = setTimeout(() => onHighlightSeen?.(), 1800);
    return () => clearTimeout(t);
  }, [highlighted, onHighlightSeen]);

  return (
    <article
      ref={ref}
      id={`entry-${entry.id}`}
      className="mb-[1.45em] scroll-mt-6 [overflow-wrap:anywhere]"
      style={highlighted ? { animation: "highlight-pulse 1.8s ease-out forwards" } : undefined}
    >
      <p>
        <time dateTime={entry.published_at}>{formatDate(d)}</time>
        <span className="text-faint"> · {formatTime(d)}</span>
      </p>
      {isPrivate ? (
        <p className="text-faint">[private]</p>
      ) : (
        entry.body && <p>{renderBody(entry.body)}</p>
      )}
      {entry.media.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {entry.media.map((m) => (
            <img
              key={m.id}
              src={m.url}
              alt=""
              loading="lazy"
              width={m.width}
              height={m.height}
              className="block h-auto max-w-full sm:max-w-[360px]"
            />
          ))}
        </div>
      )}
    </article>
  );
}

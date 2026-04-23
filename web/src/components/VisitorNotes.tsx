import { useEffect, useState } from "react";
import { fetchVisitorNotes, postVisitorNote } from "../lib/api";
import type { VisitorNote } from "../types";

interface Props {
  compact?: boolean;
  onReady?: () => void;
}

export default function VisitorNotes({ compact, onReady }: Props) {
  const [notes, setNotes] = useState<VisitorNote[]>([]);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchVisitorNotes()
      .then((data) => {
        setNotes(data);
        requestAnimationFrame(() => setLoaded(true));
        onReady?.();
      })
      .catch(() => {
        onReady?.();
      });
  }, []);

  async function submit() {
    if (!body.trim() || posting) return;
    setPosting(true);
    setFeedback(null);
    try {
      const note = await postVisitorNote(body.trim());
      setNotes((prev) => [note, ...prev]);
      setBody("");
      setFeedback({ ok: true, msg: "posted" });
    } catch {
      setFeedback({ ok: false, msg: "failed" });
    } finally {
      setPosting(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-[10px] tracking-[2px] uppercase text-faint mb-3">
        visitor notes
        <span className="flex-1 h-px bg-border" />
      </div>

      {/* Input */}
      <div className="flex gap-1.5 mb-2">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, 280))}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="leave me a note please..."
          maxLength={280}
          className="flex-1 bg-surface-2 border border-border text-ink font-mono text-[11px] font-light px-2 py-1.5 rounded outline-none focus:border-border-light placeholder:text-faint"
        />
        <button
          onClick={submit}
          disabled={posting || !body.trim()}
          className="bg-surface-3 border border-border text-muted font-mono text-[10px] px-2.5 py-1.5 rounded cursor-pointer tracking-widest transition-all hover:bg-border hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed"
        >
          post
        </button>
      </div>

      {/* Counter + feedback */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[9px] text-faint tracking-widest">
          {notes.length} note{notes.length !== 1 ? "s" : ""}
        </span>
        {feedback && (
          <span className={`text-[9px] tracking-wider ${feedback.ok ? "text-green" : "text-accent"}`}>
            {feedback.msg}
          </span>
        )}
      </div>

      {/* Chip wall */}
      <div className={`flex flex-wrap gap-1 overflow-y-auto ${compact ? "max-h-24" : "max-h-48"}`}>
        {notes.length === 0 && (
          <p className="text-[10px] text-faint italic">no notes yet</p>
        )}
        {notes.map((n, i) => (
          <div
            key={n.id}
            className="text-[10px] font-light px-2 py-1 bg-surface-2 border border-border rounded text-muted tracking-wide opacity-0 animate-[chip-in_0.3s_ease_forwards]"
            style={loaded ? { animationDelay: `${i * 30}ms` } : undefined}
          >
            {n.body}
          </div>
        ))}
      </div>
    </div>
  );
}

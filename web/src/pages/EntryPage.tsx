import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { fetchEntry } from "../lib/api";
import type { Entry } from "../types";
import EntryCard from "../components/Entry";
import Lightbox from "../components/Lightbox";
import Logo from "../components/Logo";

export default function EntryPage() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [error, setError] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchEntry(id)
      .then((e) => {
        setEntry(e);
        const photo = params.get("photo");
        if (photo) {
          const idx = e.media.findIndex((m) => m.id === photo);
          if (idx >= 0) setLightboxIdx(idx);
        }
      })
      .catch(() => setError(true));
  }, [id, params]);

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted text-[12px] mb-4">transmission not found.</p>
        <Link to="/" className="text-accent hover:text-accent/80 text-[11px] tracking-widest">
          ← back to feed
        </Link>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Logo float size={48} className="opacity-50" />
        <span className="text-[10px] text-faint tracking-[3px] uppercase">loading</span>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/"
        className="inline-block mb-6 text-[11px] text-accent hover:text-accent/80 transition-colors tracking-widest"
      >
        ← back to feed
      </Link>

      <EntryCard entry={entry} prominent />

      {lightboxIdx !== null && (
        <Lightbox
          media={entry.media}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onChange={setLightboxIdx}
        />
      )}
    </div>
  );
}

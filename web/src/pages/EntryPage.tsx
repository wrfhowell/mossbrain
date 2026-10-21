import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Thought from "../components/Thought";
import { fetchEntry } from "../lib/api";
import type { Entry } from "../types";

export default function EntryPage() {
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchEntry(id).then(setEntry).catch(() => setError(true));
  }, [id]);

  return (
    <main className="max-w-[720px] px-4 sm:px-8 pt-8 pb-32">
      <p>
        <Link to="/thoughts">← thoughts</Link>
      </p>
      <div className="mt-8">
        {error && <p className="text-faint">not found.</p>}
        {!entry && !error && <p className="text-faint">loading…</p>}
        {entry && <Thought entry={entry} />}
      </div>
    </main>
  );
}

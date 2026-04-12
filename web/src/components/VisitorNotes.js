import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { fetchVisitorNotes, postVisitorNote } from "../lib/api";
export default function VisitorNotes() {
    const [notes, setNotes] = useState([]);
    const [body, setBody] = useState("");
    const [posting, setPosting] = useState(false);
    const [feedback, setFeedback] = useState(null);
    useEffect(() => {
        fetchVisitorNotes().then(setNotes).catch(() => { });
    }, []);
    async function submit() {
        if (!body.trim() || posting)
            return;
        setPosting(true);
        setFeedback(null);
        try {
            const note = await postVisitorNote(body.trim());
            setNotes((prev) => [note, ...prev]);
            setBody("");
            setFeedback({ ok: true, msg: "posted" });
        }
        catch {
            setFeedback({ ok: false, msg: "failed" });
        }
        finally {
            setPosting(false);
            setTimeout(() => setFeedback(null), 3000);
        }
    }
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 text-[10px] tracking-[2px] uppercase text-faint mb-3", children: ["visitor notes", _jsx("span", { className: "flex-1 h-px bg-border" })] }), _jsxs("div", { className: "flex gap-1.5 mb-2", children: [_jsx("input", { type: "text", value: body, onChange: (e) => setBody(e.target.value.slice(0, 280)), onKeyDown: (e) => e.key === "Enter" && submit(), placeholder: "leave a note\u2026", maxLength: 280, className: "flex-1 bg-surface-2 border border-border text-ink font-mono text-[11px] font-light px-2 py-1.5 rounded outline-none focus:border-border-light placeholder:text-faint" }), _jsx("button", { onClick: submit, disabled: posting || !body.trim(), className: "bg-surface-3 border border-border text-muted font-mono text-[10px] px-2.5 py-1.5 rounded cursor-pointer tracking-widest transition-all hover:bg-border hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed", children: "post" })] }), _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsxs("span", { className: "text-[9px] text-faint tracking-widest", children: [notes.length, " note", notes.length !== 1 ? "s" : ""] }), feedback && (_jsx("span", { className: `text-[9px] tracking-wider ${feedback.ok ? "text-green" : "text-accent"}`, children: feedback.msg }))] }), _jsxs("div", { className: "flex flex-wrap gap-1 max-h-48 overflow-y-auto", children: [notes.length === 0 && (_jsx("p", { className: "text-[10px] text-faint italic", children: "no notes yet" })), notes.map((n) => (_jsx("div", { className: "text-[10px] font-light px-2 py-1 bg-surface-2 border border-border rounded text-muted tracking-wide animate-[chip-in_0.25s_ease_forwards]", children: n.body }, n.id)))] })] }));
}

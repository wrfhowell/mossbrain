import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { fetchEntry } from "../lib/api";
import EntryCard from "../components/Entry";
import Lightbox from "../components/Lightbox";
import Logo from "../components/Logo";
export default function EntryPage() {
    const { id } = useParams();
    const [params] = useSearchParams();
    const [entry, setEntry] = useState(null);
    const [error, setError] = useState(false);
    const [lightboxIdx, setLightboxIdx] = useState(null);
    useEffect(() => {
        if (!id)
            return;
        fetchEntry(id)
            .then((e) => {
            setEntry(e);
            const photo = params.get("photo");
            if (photo) {
                const idx = e.media.findIndex((m) => m.id === photo);
                if (idx >= 0)
                    setLightboxIdx(idx);
            }
        })
            .catch(() => setError(true));
    }, [id, params]);
    if (error) {
        return (_jsxs("div", { className: "py-12 text-center", children: [_jsx("p", { className: "text-muted text-[12px] mb-4", children: "transmission not found." }), _jsx(Link, { to: "/", className: "text-accent hover:text-accent/80 text-[11px] tracking-widest", children: "\u2190 back to feed" })] }));
    }
    if (!entry) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center py-16 gap-4", children: [_jsx(Logo, { float: true, size: 48, className: "opacity-50" }), _jsx("span", { className: "text-[10px] text-faint tracking-[3px] uppercase", children: "loading" })] }));
    }
    return (_jsxs("div", { children: [_jsx(Link, { to: "/", className: "inline-block mb-6 text-[11px] text-accent hover:text-accent/80 transition-colors tracking-widest", children: "\u2190 back to feed" }), _jsx(EntryCard, { entry: entry, prominent: true }), lightboxIdx !== null && (_jsx(Lightbox, { media: entry.media, index: lightboxIdx, onClose: () => setLightboxIdx(null), onChange: setLightboxIdx }))] }));
}

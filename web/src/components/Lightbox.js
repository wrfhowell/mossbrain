import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useCallback } from "react";
export default function Lightbox({ media, index, onClose, onChange }) {
    const hasPrev = index > 0;
    const hasNext = index < media.length - 1;
    const onKey = useCallback((e) => {
        if (e.key === "Escape")
            onClose();
        if (e.key === "ArrowLeft" && hasPrev)
            onChange(index - 1);
        if (e.key === "ArrowRight" && hasNext)
            onChange(index + 1);
    }, [onClose, onChange, index, hasPrev, hasNext]);
    useEffect(() => {
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [onKey]);
    const current = media[index];
    if (!current)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-[1000] flex items-center justify-center", onClick: onClose, children: [_jsx("div", { className: "absolute inset-0 bg-[rgba(40,36,28,0.88)] backdrop-blur-sm" }), _jsxs("div", { className: "relative z-10 w-[85%] max-w-[600px] animate-[lb-in_0.35s_cubic-bezier(0.22,1,0.36,1)_forwards]", onClick: (e) => e.stopPropagation(), children: [_jsx("button", { onClick: onClose, className: "absolute -top-7 right-0 text-[10px] text-[#8a8880] hover:text-[#d4d2cc] tracking-[2px] cursor-pointer bg-transparent border-none font-mono", children: "[esc]" }), hasPrev && (_jsx("button", { onClick: () => onChange(index - 1), className: "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-10 text-[#8a8880] hover:text-[#d4d2cc] text-2xl cursor-pointer bg-transparent border-none", children: "\u2039" })), hasNext && (_jsx("button", { onClick: () => onChange(index + 1), className: "absolute right-0 top-1/2 -translate-y-1/2 translate-x-10 text-[#8a8880] hover:text-[#d4d2cc] text-2xl cursor-pointer bg-transparent border-none", children: "\u203A" })), _jsx("img", { src: current.url, alt: "", className: "w-full rounded-sm", onClick: (e) => e.stopPropagation() }), _jsx("p", { className: "text-center mt-3 font-hand text-lg text-[#c8c4b8]", children: "photograph" }), _jsx("p", { className: "text-center mt-1 text-[9px] text-[#8a8880] tracking-[2px] uppercase", children: current.width && current.height ? `${current.width}×${current.height}` : "" })] })] }));
}

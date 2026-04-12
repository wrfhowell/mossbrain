import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from "react";
import { useParallax } from "../hooks/useParallax";
import { useAuth } from "../context/AuthContext";
import AdminBar from "./AdminBar";
import Logo from "./Logo";
import MarginCollage from "./MarginCollage";
import LabelFilter from "./LabelFilter";
import PhotoMosaic from "./PhotoMosaic";
import VisitorNotes from "./VisitorNotes";
export default function Layout({ children, labels }) {
    const scrollRef = useRef(null);
    const scrollY = useParallax(scrollRef);
    const { admin } = useAuth();
    return (_jsxs("div", { className: "relative min-h-screen", children: [_jsx(AdminBar, {}), _jsx("div", { className: "hidden 2xl:block fixed left-0 top-0 w-28 h-full pointer-events-none opacity-40", children: _jsx(MarginCollage, { scrollY: scrollY }) }), _jsxs("div", { className: `max-w-[1320px] mx-auto px-6 md:px-12 py-10 flex flex-col min-h-screen ${admin ? "pt-14" : ""}`, children: [_jsxs("header", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 mb-6 border-b border-border", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Logo, { size: 28 }), _jsxs("div", { className: "font-medium text-sm tracking-wide text-ink", children: ["scattered transmissions", _jsx("span", { className: "text-faint font-light text-[11px] ml-2 tracking-widest", children: "/ mossbrain" })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-[10px] text-faint tracking-widest", children: [_jsx("span", { className: "w-[5px] h-[5px] rounded-full bg-green animate-[pulse-dot_2s_ease_infinite]" }), "live"] }), _jsx(LabelFilter, { labels: labels })] })] }), _jsxs("div", { className: "flex-1 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-0 min-h-0", children: [_jsx("main", { ref: scrollRef, className: "lg:border-r lg:border-border lg:pr-8 overflow-y-auto max-h-[calc(100vh-140px)] lg:max-h-[calc(100vh-180px)]", children: children }), _jsxs("aside", { className: "hidden lg:flex flex-col pl-6", children: [_jsx(PhotoMosaic, {}), _jsx("div", { className: "border-t border-border mt-3 pt-4", children: _jsx(VisitorNotes, {}) })] })] }), _jsxs("div", { className: "lg:hidden mt-6 space-y-6", children: [_jsx(PhotoMosaic, {}), _jsx("div", { className: "border-t border-border pt-4", children: _jsx(VisitorNotes, {}) })] }), _jsxs("footer", { className: "mt-8 pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-faint tracking-widest", children: [_jsx("span", { children: "scattered transmissions 2026" }), _jsx(Logo, { size: 20, className: "opacity-40" }), _jsx("span", { children: "film / chalk / ink / light" })] })] })] }));
}

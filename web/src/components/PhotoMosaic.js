import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMediaSample } from "../lib/api";
const GRADIENT_CLASSES = [
    "bg-gradient-to-br from-[#7a5a3a] to-[#8a6a4a]",
    "bg-gradient-to-br from-[#3a5565] to-[#4a6a7a]",
    "bg-gradient-to-br from-[#2a2a2a] to-[#404040]",
    "bg-gradient-to-br from-[#6a5a20] to-[#7a6a30]",
    "bg-gradient-to-br from-[#3a4a30] to-[#4a5a40]",
    "bg-gradient-to-br from-[#4a3a5a] to-[#5a4a6a]",
    "bg-gradient-to-br from-[#6a3020] to-[#7a4030]",
];
const ROTATIONS = [
    "-rotate-[1.2deg]",
    "rotate-[0.8deg]",
    "-rotate-[0.5deg]",
    "rotate-[1.5deg]",
    "-rotate-[0.9deg]",
    "rotate-[0.6deg]",
    "-rotate-[1deg]",
];
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
export default function PhotoMosaic() {
    const [media, setMedia] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        fetchMediaSample().then(setMedia).catch(() => { });
    }, []);
    const doShuffle = useCallback(() => {
        setMedia((m) => shuffle(m));
    }, []);
    if (media.length === 0)
        return null;
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 text-[10px] tracking-[2px] uppercase text-faint mb-3", children: ["photographs", _jsx("span", { className: "flex-1 h-px bg-border" }), _jsx("button", { onClick: doShuffle, className: "text-faint hover:text-muted transition-colors cursor-pointer tracking-[1px] normal-case", children: "shuffle \u21BB" })] }), _jsx("div", { className: "max-h-[340px] overflow-y-auto", children: _jsx("div", { className: "grid grid-cols-5 gap-[3px]", children: media.map((m, i) => {
                        const grad = GRADIENT_CLASSES[i % GRADIENT_CLASSES.length];
                        const rot = ROTATIONS[i % ROTATIONS.length];
                        return (_jsx("button", { onClick: () => navigate(`/log/${m.entry_id}`), className: `aspect-square overflow-hidden rounded-sm cursor-pointer transition-all duration-150 hover:scale-105 hover:opacity-85 hover:z-10 ${rot}`, title: m.url.split("/").pop() ?? "", children: m.url ? (_jsx("img", { src: m.url, alt: "", loading: "lazy", className: "w-full h-full object-cover" })) : (_jsx("div", { className: `w-full h-full flex items-center justify-center text-[6px] tracking-widest text-white/30 ${grad}`, children: "PHOTO" })) }, m.id));
                    }) }) })] }));
}

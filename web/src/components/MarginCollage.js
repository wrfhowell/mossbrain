import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
const shapes = [
    { id: 1, top: 80, left: 16, speed: 0.3, el: _jsx("circle", { cx: "16", cy: "16", r: "14", fill: "none", stroke: "currentColor", strokeWidth: "1", opacity: "0.2" }), w: 32, h: 32 },
    { id: 2, top: 220, left: 50, speed: 0.5, el: _jsx("rect", { x: "2", y: "2", width: "20", height: "20", rx: "3", fill: "currentColor", opacity: "0.06" }), w: 24, h: 24 },
    { id: 3, top: 380, left: 8, speed: 0.4, el: _jsx("path", { d: "M12 2L2 22h20z", fill: "none", stroke: "currentColor", strokeWidth: "1", opacity: "0.15" }), w: 24, h: 24 },
    { id: 4, top: 540, left: 40, speed: 0.65, el: _jsx("circle", { cx: "6", cy: "6", r: "5", fill: "currentColor", opacity: "0.08" }), w: 12, h: 12 },
    { id: 5, top: 700, left: 20, speed: 0.35, el: _jsx("line", { x1: "0", y1: "0", x2: "30", y2: "30", stroke: "currentColor", strokeWidth: "0.8", opacity: "0.12" }), w: 30, h: 30 },
    { id: 6, top: 860, left: 45, speed: 0.55, el: _jsx("ellipse", { cx: "14", cy: "8", rx: "12", ry: "7", fill: "none", stroke: "currentColor", strokeWidth: "0.8", opacity: "0.15" }), w: 28, h: 16 },
    { id: 7, top: 1020, left: 12, speed: 0.45, el: _jsxs(_Fragment, { children: [_jsx("circle", { cx: "5", cy: "5", r: "2.5", fill: "currentColor", opacity: "0.1" }), _jsx("circle", { cx: "15", cy: "5", r: "2.5", fill: "currentColor", opacity: "0.07" }), _jsx("circle", { cx: "10", cy: "14", r: "2.5", fill: "currentColor", opacity: "0.08" })] }), w: 20, h: 18 },
    { id: 8, top: 1200, left: 35, speed: 0.5, el: _jsx("path", { d: "M0 12Q8 0 16 12Q24 24 32 12", fill: "none", stroke: "currentColor", strokeWidth: "1", opacity: "0.15" }), w: 32, h: 24 },
];
export default function MarginCollage({ scrollY }) {
    return (_jsx("div", { className: "relative h-full w-full text-border-light overflow-hidden", children: shapes.map((s) => (_jsx("svg", { width: s.w, height: s.h, viewBox: `0 0 ${s.w} ${s.h}`, className: "absolute motion-safe:transition-transform motion-safe:duration-100", style: {
                top: s.top,
                left: s.left,
                transform: `translateY(${scrollY * -s.speed}px)`,
            }, children: s.el }, s.id))) }));
}

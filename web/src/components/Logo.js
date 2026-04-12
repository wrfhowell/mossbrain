import { jsx as _jsx } from "react/jsx-runtime";
export default function Logo({ className = "", float: doFloat = false, size = 48 }) {
    return (_jsx("img", { src: "/logo.png", alt: "mossbrain", width: size, height: Math.round(size * (161 / 242)), className: `${doFloat ? "animate-[float_2.4s_ease-in-out_infinite]" : ""} ${className}` }));
}

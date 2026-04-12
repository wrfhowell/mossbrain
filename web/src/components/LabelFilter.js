import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSearchParams } from "react-router-dom";
export default function LabelFilter({ labels }) {
    const [params, setParams] = useSearchParams();
    const active = params.get("label") ?? "";
    function select(label) {
        if (label) {
            setParams({ label });
        }
        else {
            setParams({});
        }
    }
    return (_jsxs("nav", { className: "flex gap-2 flex-wrap", children: [_jsx("button", { onClick: () => select(""), className: `text-[10px] tracking-[1.5px] uppercase px-2 py-0.5 border rounded cursor-pointer transition-all ${!active
                    ? "border-border-light text-ink bg-surface-2"
                    : "border-transparent text-faint hover:border-border-light hover:text-muted"}`, children: "all" }), labels.map((l) => (_jsx("button", { onClick: () => select(l), className: `text-[10px] tracking-[1.5px] uppercase px-2 py-0.5 border rounded cursor-pointer transition-all ${active === l
                    ? "border-border-light text-ink bg-surface-2"
                    : "border-transparent text-faint hover:border-border-light hover:text-muted"}`, children: l }, l)))] }));
}

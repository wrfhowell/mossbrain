import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "../context/AuthContext";
export default function AdminBar() {
    const { admin, email, logout } = useAuth();
    if (!admin)
        return null;
    return (_jsxs("div", { className: "fixed top-0 inset-x-0 z-50 flex items-center justify-end gap-3 bg-surface/90 backdrop-blur px-4 py-1.5 text-[10px] text-faint border-b border-border tracking-wider", children: [_jsxs("span", { children: ["signed in as ", _jsx("span", { className: "text-ink", children: email })] }), _jsx("button", { onClick: logout, className: "text-accent hover:text-accent/80 transition-colors cursor-pointer", children: "sign out" })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Logo from "./components/Logo";
import HomePage from "./pages/HomePage";
import EntryPage from "./pages/EntryPage";
function Splash({ onDone }) {
    const [fading, setFading] = useState(false);
    useEffect(() => {
        const fadeTimer = setTimeout(() => setFading(true), 500);
        const doneTimer = setTimeout(onDone, 800);
        return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
    }, [onDone]);
    return (_jsxs("div", { className: `fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-base transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`, children: [_jsx(Logo, { float: true, size: 72 }), _jsx("span", { className: "text-[10px] text-faint tracking-[3px] uppercase font-mono", children: "mossbrain" })] }));
}
export default function App() {
    const [labels, setLabels] = useState([]);
    const [splashDone, setSplashDone] = useState(false);
    const onLabelsChange = useCallback((l) => setLabels(l), []);
    const onSplashDone = useCallback(() => setSplashDone(true), []);
    return (_jsx(BrowserRouter, { children: _jsxs(AuthProvider, { children: [!splashDone && _jsx(Splash, { onDone: onSplashDone }), _jsx(Layout, { labels: labels, children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, { onLabelsChange: onLabelsChange }) }), _jsx(Route, { path: "/log/:id", element: _jsx(EntryPage, {}) })] }) })] }) }));
}

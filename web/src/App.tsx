import { useState, useCallback, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Logo from "./components/Logo";
import HomePage from "./pages/HomePage";
import EntryPage from "./pages/EntryPage";

function Splash({ onDone, ready }: { onDone: () => void; ready: boolean }) {
  const [minTime, setMinTime] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinTime(true), 1100);
    return () => clearTimeout(t);
  }, []);

  // Fallback: dismiss after 4s even if data hasn't loaded
  const [maxWait, setMaxWait] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMaxWait(true), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (minTime && (ready || maxWait) && !fading) {
      setFading(true);
      const t = setTimeout(onDone, 300);
      return () => clearTimeout(t);
    }
  }, [minTime, ready, maxWait, fading, onDone]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-10 bg-base transition-opacity duration-300 ${fading ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      <Logo float floatSpeed="1.2s" size={72} />
      <span className="text-[10px] text-faint tracking-[3px] uppercase font-mono">
        stone wizard
      </span>
    </div>
  );
}

export default function App() {
  const [labels, setLabels] = useState<string[]>([]);
  const [splashDone, setSplashDone] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const onLabelsChange = useCallback((incoming: string[]) => {
    setLabels((prev) => {
      const merged = Array.from(new Set([...prev, ...incoming])).sort();
      if (merged.length === prev.length && merged.every((l, i) => l === prev[i]))
        return prev;
      return merged;
    });
  }, []);
  const onSplashDone = useCallback(() => setSplashDone(true), []);
  const onDataReady = useCallback(() => setDataReady(true), []);

  return (
    <BrowserRouter>
      <AuthProvider>
        {!splashDone && <Splash onDone={onSplashDone} ready={dataReady} />}
        <Layout labels={labels} onDataReady={onDataReady}>
          <Routes>
            <Route path="/" element={<HomePage onLabelsChange={onLabelsChange} />} />
            <Route path="/log/:id" element={<EntryPage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { useState, useCallback, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Logo from "./components/Logo";
import HomePage from "./pages/HomePage";
import EntryPage from "./pages/EntryPage";

function Splash({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1100);
    const doneTimer = setTimeout(onDone, 1400);
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-10 bg-base transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}
    >
      <Logo float floatSpeed="1.2s" size={72} />
      <span className="text-[10px] text-faint tracking-[3px] uppercase font-mono">
        mossbrain
      </span>
    </div>
  );
}

export default function App() {
  const [labels, setLabels] = useState<string[]>([]);
  const [splashDone, setSplashDone] = useState(false);
  const onLabelsChange = useCallback((l: string[]) => setLabels(l), []);
  const onSplashDone = useCallback(() => setSplashDone(true), []);

  return (
    <BrowserRouter>
      <AuthProvider>
        {!splashDone && <Splash onDone={onSplashDone} />}
        <Layout labels={labels}>
          <Routes>
            <Route path="/" element={<HomePage onLabelsChange={onLabelsChange} />} />
            <Route path="/log/:id" element={<EntryPage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

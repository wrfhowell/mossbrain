import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import AdminBar from "./components/AdminBar";
import { AuthProvider } from "./context/AuthContext";
import { PAGES } from "./lib/pages";
import BlankPage from "./pages/BlankPage";
import CanadaPage from "./pages/CanadaPage";
import ContactPage from "./pages/ContactPage";
import DesignPage from "./pages/DesignPage";
import EntryPage from "./pages/EntryPage";
import HomePage from "./pages/HomePage";
import MountainsPage from "./pages/MountainsPage";
import ProjectsPage from "./pages/ProjectsPage";
import TeamsPage from "./pages/TeamsPage";
import ThoughtsPage from "./pages/ThoughtsPage";

// Pages with their own routes; the rest of PAGES fall back to the placeholder
const BUILT = new Set(["/thoughts", "/design", "/teams", "/research", "/contact", "/projects", "/mountains"]);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <AdminBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/thoughts" element={<ThoughtsPage />} />
          <Route path="/log/:id" element={<EntryPage />} />
          <Route path="/design" element={<DesignPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/canada" element={<CanadaPage />} />
          <Route path="/mountains" element={<MountainsPage />} />
          <Route path="/mountains/climbing" element={<BlankPage />} />
          <Route path="/mountains/rescues" element={<BlankPage />} />
          <Route path="/research" element={<BlankPage message="coming soon..." />} />
          {PAGES.filter((p) => !BUILT.has(p.path)).map((p) => (
            <Route key={p.path} path={p.path} element={<BlankPage />} />
          ))}
          <Route path="*" element={<BlankPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

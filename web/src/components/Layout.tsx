import { type ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { useParallax } from "../hooks/useParallax";
import AdminBar from "./AdminBar";
import LabelFilter from "./LabelFilter";
import Logo from "./Logo";
import MarginCollage from "./MarginCollage";
import PhotoGraph from "./PhotoGraph";
import VisitorNotes from "./VisitorNotes";

interface Props {
  children: ReactNode;
  labels: string[];
  onDataReady?: () => void;
}

const wizardIntro = (
  <div className="text-[13px] leading-[1.8] tracking-[2px] text-muted">
    <span className="font-bold uppercase">WELCOME TO THE TOWER</span>
    <br />
    Stone Wizard® celestial propaganda broadcast. Unfiltered ideas from a wizard
    in training. Field notes on stones, medicine, climbing, drawing, music,
    nature, healthcare, and relationships. The brainwashing is already underway.
    If you experience dizziness, sudden clarity, or an inexplicable urge to cast
    an incantation, do not discontinue. This is working as intended.
  </div>
);

export default function Layout({ children, labels, onDataReady }: Props) {
  const scrollY = useParallax();
  const { admin } = useAuth();

  return (
    <div className="relative min-h-screen">
      <AdminBar />

      {/* Margin collage - subtle, only on wide screens */}
      <div className="hidden 2xl:block fixed left-0 top-0 w-28 h-full pointer-events-none opacity-40">
        <MarginCollage scrollY={scrollY} />
      </div>

      <div
        className={`max-w-[1320px] mx-auto px-8 md:px-16 py-10 flex flex-col min-h-screen ${admin ? "pt-14" : ""}`}
      >
        {/* Top bar */}
        <header className="flex items-center gap-3 pb-5 mb-6">
          <Logo size={28} />
          <div className="font-medium text-lg tracking-wide text-ink">
            stone wizard
          </div>
        </header>

        {/* Mobile: Photos → Filter → Notes → Feed */}
        <div className="lg:hidden space-y-6">
          <PhotoGraph />
          {wizardIntro}
          <LabelFilter labels={labels} />
          <div className="border-t border-border pt-4">
            <VisitorNotes compact onReady={onDataReady} />
          </div>
        </div>

        {/* Main grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-0 min-h-0">
          {/* Left: Feed */}
          <main className="lg:border-r lg:border-border lg:pr-8">
            {children}
          </main>

          {/* Right: Photos + Filter + Notes */}
          <aside className="hidden lg:flex flex-col pl-6 self-start sticky top-10">
            <PhotoGraph />
            <div className="mt-3">{wizardIntro}</div>
            <div className="border-t border-border mt-3 pt-4">
              <LabelFilter labels={labels} />
            </div>
            <div className="border-t border-border mt-3 pt-4">
              <VisitorNotes onReady={onDataReady} />
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 text-[13px] text-faint tracking-widest">
          <span></span>
          <Logo size={20} className="opacity-40" />
          <span></span>
        </footer>
      </div>
    </div>
  );
}

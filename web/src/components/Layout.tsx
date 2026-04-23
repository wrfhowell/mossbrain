import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useParallax } from "../hooks/useParallax";
import AdminBar from "./AdminBar";
import LabelFilter from "./LabelFilter";
import Logo from "./Logo";
import MarginCollage from "./MarginCollage";
import PhotoGraph from "./PhotoGraph";
import VisitorNotes from "./VisitorNotes";
import WizardModel from "./WizardModel";

interface Props {
  children: ReactNode;
  labels: string[];
  onDataReady?: () => void;
}

const wizardIntro = (
  <div className="text-[13px] leading-[1.8] tracking-[2px] text-muted">
    <span className="font-bold uppercase">WELCOME TO THE TOWER</span>
    <br />
    Stone Wizard™ celestial propaganda broadcast. Unfiltered ideas from a wizard
    in training. Field notes on stones, medicine, climbing, drawing, music,
    nature, healthcare, and relationships. The brainwashing is already underway.
    If you experience dizziness, sudden clarity, or an inexplicable urge to cast
    an incantation, do not discontinue - this is working as intended. Interact
    with the cosmic photo constellation below. Click an image to view the
    prophecy.
  </div>
);

function useStickyScroll() {
  const ref = useRef<HTMLElement>(null);
  const [stickyTop, setStickyTop] = useState(40);

  const recalc = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const sidebarH = el.scrollHeight;
    const viewportH = window.innerHeight;
    const pad = 40;
    if (sidebarH > viewportH - pad) {
      setStickyTop(-(sidebarH - viewportH + pad));
    } else {
      setStickyTop(pad);
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    window.addEventListener("resize", recalc);
    recalc();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalc);
    };
  }, [recalc]);

  return { ref, stickyTop };
}

export default function Layout({ children, labels, onDataReady }: Props) {
  const scrollY = useParallax();
  const { admin } = useAuth();
  const { ref: sidebarRef, stickyTop } = useStickyScroll();

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
        {/* Mobile: Wizard → Intro → Photos → Filter → Notes → Feed */}
        <div className="lg:hidden space-y-6">
          <WizardModel size={132} />
          {wizardIntro}
          <PhotoGraph />
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

          {/* Right: Wizard + Intro + Photos + Filter + Notes */}
          <aside
            ref={sidebarRef}
            className="hidden lg:flex flex-col pl-6 self-start sticky"
            style={{ top: stickyTop }}
          >
            <WizardModel size={132} />
            <div className="mb-3">{wizardIntro}</div>
            <PhotoGraph />
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

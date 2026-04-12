import { useRef, type ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { useParallax } from "../hooks/useParallax";
import AdminBar from "./AdminBar";
import LabelFilter from "./LabelFilter";
import Logo from "./Logo";
import MarginCollage from "./MarginCollage";
import PhotoMosaic from "./PhotoMosaic";
import VisitorNotes from "./VisitorNotes";

interface Props {
  children: ReactNode;
  labels: string[];
}

export default function Layout({ children, labels }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollY = useParallax(scrollRef);
  const { admin } = useAuth();

  return (
    <div className="relative min-h-screen">
      <AdminBar />

      {/* Margin collage - subtle, only on wide screens */}
      <div className="hidden 2xl:block fixed left-0 top-0 w-28 h-full pointer-events-none opacity-40">
        <MarginCollage scrollY={scrollY} />
      </div>

      <div
        className={`max-w-[1320px] mx-auto px-6 md:px-12 py-10 flex flex-col min-h-screen ${admin ? "pt-14" : ""}`}
      >
        {/* Top bar */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <div className="font-medium text-sm tracking-wide text-ink">
              mossbrain
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LabelFilter labels={labels} />
          </div>
        </header>

        {/* Main grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-0 min-h-0">
          {/* Left: Feed */}
          <main
            ref={scrollRef}
            className="lg:border-r lg:border-border lg:pr-8 overflow-y-auto max-h-[calc(100vh-140px)] lg:max-h-[calc(100vh-180px)]"
          >
            {children}
          </main>

          {/* Right: Photos + Notes */}
          <aside className="hidden lg:flex flex-col pl-6">
            <PhotoMosaic />
            <div className="border-t border-border mt-3 pt-4">
              <VisitorNotes />
            </div>
          </aside>
        </div>

        {/* Mobile: Photos + Notes below feed */}
        <div className="lg:hidden mt-6 space-y-6">
          <PhotoMosaic />
          <div className="border-t border-border pt-4">
            <VisitorNotes />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-faint tracking-widest">
          <span>mossbrain</span>
          <Logo size={20} className="opacity-40" />
          <span>film / chalk / ink / light</span>
        </footer>
      </div>
    </div>
  );
}

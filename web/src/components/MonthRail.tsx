import { useCallback, useEffect, useRef, useState } from "react";

export interface MonthGroup {
  key: string; // YYYY-MM
  count: number;
}

const THUMB_PCT = 10;

function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  const name = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", { month: "short" });
  return `${name.toLowerCase()} '${y.slice(2)}`;
}

/** Custom scrollbar pinned to the right edge with one tick per month. */
export default function MonthRail({ groups }: { groups: MonthGroup[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const thumbRef = useRef<HTMLDivElement>(null);
  const lastRef = useRef<string | null>(null);

  useEffect(() => {
    if (groups.length === 0) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
        if (thumbRef.current) thumbRef.current.style.top = `${pct * (100 - THUMB_PCT)}%`;

        let current = groups[0].key;
        for (const g of groups) {
          const el = document.getElementById(`month-${g.key}`);
          if (el && el.getBoundingClientRect().top <= 160) current = g.key;
        }
        if (current !== lastRef.current) {
          lastRef.current = current;
          setActive(current);
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [groups]);

  const jump = useCallback((key: string) => {
    document.getElementById(`month-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (groups.length < 2) return null;

  return (
    <nav
      aria-label="months"
      className="hidden lg:flex fixed right-5 top-8 z-30 flex-row-reverse"
      style={{ height: "calc(100vh - 250px)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* track */}
      <div className="relative flex flex-col w-[5px]">
        <div className="absolute left-[2px] inset-y-0 w-px bg-border" />
        <div
          ref={thumbRef}
          className="absolute left-[1px] w-[3px] bg-muted pointer-events-none"
          style={{ height: `${THUMB_PCT}%`, top: 0, transition: "top 100ms linear" }}
        />
        {groups.map((g) => (
          <button
            key={g.key}
            aria-label={monthLabel(g.key)}
            onClick={() => jump(g.key)}
            className="relative flex items-start cursor-pointer min-h-0"
            style={{ flex: Math.max(g.count, 2) }}
          >
            <span
              className={`block w-[5px] h-[5px] relative z-10 ${active === g.key ? "bg-ink" : "bg-border-light"}`}
            />
          </button>
        ))}
      </div>

      {/* labels: active always, the rest on hover */}
      <div className="flex flex-col pr-2 items-end" style={{ pointerEvents: hovered ? "auto" : "none" }}>
        {groups.map((g) => {
          const isActive = active === g.key;
          return (
            <button
              key={g.key}
              onClick={() => jump(g.key)}
              className="min-h-0 cursor-pointer flex items-start"
              style={{ flex: Math.max(g.count, 2) }}
            >
              <span
                className={`text-[11px] leading-none whitespace-nowrap transition-opacity duration-150 ${isActive ? "text-ink" : "text-faint hover:text-link"}`}
                style={{ opacity: isActive || hovered ? 1 : 0, marginTop: -2 }}
              >
                {monthLabel(g.key)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

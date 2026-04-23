import { useCallback, useEffect, useRef, useState } from "react";

interface DateGroup {
  key: string;
  label: string;
  entryCount: number;
}

interface Props {
  groups: DateGroup[];
}

function shortDate(key: string): string {
  const d = new Date(`${key}T12:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const THUMB_PCT = 12;
const NAV_W = 70;

export default function DateTimeline({ groups }: Props) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const thumbRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef<string | null>(null);

  useEffect(() => {
    if (groups.length === 0) return;

    let rafId = 0;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0;

        if (thumbRef.current) {
          thumbRef.current.style.top = `${pct * (100 - THUMB_PCT)}%`;
        }

        let active = groups[0]?.key ?? null;
        for (const g of groups) {
          const el = document.getElementById(`date-${g.key}`);
          if (el && el.getBoundingClientRect().top <= 140) {
            active = g.key;
          }
        }
        if (active !== lastActiveRef.current) {
          lastActiveRef.current = active;
          setActiveKey(active);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [groups]);

  const scrollTo = useCallback((key: string) => {
    document.getElementById(`date-${key}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  if (groups.length < 2) return null;

  return (
    <nav
      className="hidden lg:flex sticky top-10 self-start shrink-0"
      style={{ height: "calc(100vh - 120px)", width: NAV_W }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Track column: line + thumb + dots */}
      <div className="relative flex flex-col shrink-0" style={{ width: 5, minHeight: "100%" }}>
        <div className="absolute left-[2px] top-0 bottom-0 w-px bg-border pointer-events-none" />

        <div
          ref={thumbRef}
          className="absolute left-[1px] w-[3px] rounded-full pointer-events-none will-change-[top]"
          style={{
            height: `${THUMB_PCT}%`,
            top: "0%",
            transition: "top 100ms linear",
            background: "var(--color-muted)",
          }}
        />

        {groups.map((g, i) => {
          const isLast = i === groups.length - 1;
          return (
            <button
              key={g.key}
              className="relative flex items-start cursor-pointer min-h-0"
              style={{ flex: Math.max(g.entryCount, 1) }}
              onClick={() => scrollTo(g.key)}
            >
              <div className={`w-[5px] h-[5px] rounded-full shrink-0 relative z-10 transition-colors duration-200 ${activeKey === g.key ? "bg-muted" : "bg-border-light"}`} />
              {!isLast && <div className="flex-1" />}
            </button>
          );
        })}
      </div>

      {/* Labels column — active always visible, rest on hover */}
      <div
        className="flex flex-col pl-2 flex-1"
        style={{ minHeight: "100%", pointerEvents: hovered ? "auto" : "none" }}
      >
        {groups.map((g) => {
          const isActive = activeKey === g.key;
          return (
            <button
              key={g.key}
              className="min-h-0 text-left cursor-pointer flex items-start"
              style={{ flex: Math.max(g.entryCount, 1) }}
              onClick={() => scrollTo(g.key)}
            >
              <span
                className={`text-[14px] tracking-wide whitespace-nowrap leading-none transition-all duration-150 ${isActive ? "text-ink font-medium" : "text-faint hover:text-ink"}`}
                style={{ opacity: isActive ? 1 : hovered ? 1 : 0, marginTop: -1 }}
              >
                {shortDate(g.key)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

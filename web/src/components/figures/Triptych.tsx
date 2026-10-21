import { type ReactNode, type RefObject, useEffect, useRef } from "react";
import { PANEL_H, PANEL_W, prefersReducedMotion } from "../../lib/pixelScene";

export interface Panel {
  ref: RefObject<HTMLCanvasElement | null>;
  caption: ReactNode;
}

/** Three black pixel panels with grey captions, Mechanize-figure style. */
export default function Triptych({ panels, children }: { panels: Panel[]; children?: ReactNode }) {
  return (
    <figure>
      {children && <figcaption className="text-left">{children}</figcaption>}
      <div className="grid grid-cols-3 gap-3 sm:gap-8">
        {panels.map((p, i) => (
          <div key={i} className="text-center">
            <canvas
              ref={p.ref}
              width={PANEL_W}
              height={PANEL_H}
              className="pixelated block w-full bg-black"
              style={{ aspectRatio: `${PANEL_W} / ${PANEL_H}` }}
            />
            <div className="text-stretch text-[11px] sm:text-[12px] text-muted tabular-nums">
              {p.caption}
            </div>
          </div>
        ))}
      </div>
    </figure>
  );
}

/**
 * Calls `tick` at a fixed retro frame rate while `target` is on screen.
 * Under reduced motion it calls `still` once instead.
 */
export function useTicker(
  target: RefObject<HTMLElement | null>,
  fps: number,
  tick: () => void,
  still: () => void,
) {
  const tickRef = useRef(tick);
  const stillRef = useRef(still);
  tickRef.current = tick;
  stillRef.current = still;

  useEffect(() => {
    if (prefersReducedMotion()) {
      stillRef.current();
      return;
    }
    let visible = false;
    let raf = 0;
    let last = 0;
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || t - last < 1000 / fps) return;
      last = t;
      tickRef.current();
    };
    const el = target.current;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (el) io.observe(el);
    else visible = true;
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [target, fps]);
}

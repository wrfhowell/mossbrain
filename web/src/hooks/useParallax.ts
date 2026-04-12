import { useState, useEffect, type RefObject } from "react";

export function useParallax(ref: RefObject<HTMLElement | null>) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollY(el.scrollTop));
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref]);

  return scrollY;
}

import { useEffect, useRef } from "react";
import { prefersReducedMotion, rng } from "../../lib/pixelScene";

// Resting state: a 20×20 posterized pixel badge, upscaled with hard pixels like the other figures
const SIZE = 20;
const INSET = 1 / SIZE;
const LEVELS = 6;
const CSS_PX = 44;
// Hover reveal: random cells of a fine grid switch to the original logo, one by one
const CELLS = 44;
const REVEAL_MS = 500;

type RGB = [number, number, number];

// Real logos, digitized at runtime. `bg` sits behind transparent marks so dark logos stay visible.
const LOGOS = {
  kinetic: { src: "/teams/kinetic.png", bg: [255, 255, 255] as RGB },
  bamru: { src: "/teams/bamru.png", bg: [255, 255, 255] as RGB },
  commure: { src: "/teams/commure.png", bg: [0, 0, 0] as RGB },
  genesys: { src: "/teams/genesys.png", bg: [0, 0, 0] as RGB },
  rivian: { src: "/teams/rivian.png", bg: [236, 232, 220] as RGB },
  launchpad: { src: "/teams/launchpad.png", bg: [0, 0, 0] as RGB },
  ubc: { src: "/teams/ubc.png", bg: [0, 0, 0] as RGB },
};

export type TeamMark = keyof typeof LOGOS;

const posterize = (v: number) => Math.round((v / 255) * (LEVELS - 1)) * (255 / (LEVELS - 1));

/** Logo on its background at `out`×`out`: either the posterized pixel badge or the original. */
function render(img: HTMLImageElement, bg: RGB, out: number, pixelated: boolean) {
  const res = pixelated ? SIZE : out;
  const src = document.createElement("canvas");
  src.width = res;
  src.height = res;
  const sctx = src.getContext("2d")!;
  sctx.fillStyle = `rgb(${bg.join(",")})`;
  sctx.fillRect(0, 0, res, res);
  const pad = Math.round(res * INSET);
  sctx.drawImage(img, pad, pad, res - 2 * pad, res - 2 * pad);
  if (!pixelated) return src;

  const frame = sctx.getImageData(0, 0, res, res);
  const d = frame.data;
  for (let i = 0; i < res * res; i++) {
    const dim = Math.floor(i / res) % 2 ? 0.82 : 1;
    d[i * 4] = posterize(d[i * 4]) * dim;
    d[i * 4 + 1] = posterize(d[i * 4 + 1]) * dim;
    d[i * 4 + 2] = posterize(d[i * 4 + 2]) * dim;
  }
  sctx.putImageData(frame, 0, 0);
  const up = document.createElement("canvas");
  up.width = out;
  up.height = out;
  const uctx = up.getContext("2d")!;
  uctx.imageSmoothingEnabled = false;
  uctx.drawImage(src, 0, 0, out, out);
  return up;
}

/** A team's logo as a pixel badge; on hover, random cells dissolve into the real logo. */
export default function TeamLogo({ mark }: { mark: TeamMark }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const layers = useRef<{ base: HTMLCanvasElement; full: HTMLCanvasElement } | null>(null);
  // Cells in a fixed random order; the first `shown` of them display the original
  const order = useRef<number[]>([]);
  const shown = useRef(0);
  const raf = useRef(0);
  const { src, bg } = LOGOS[mark];

  const paint = () => {
    const ctx = ref.current?.getContext("2d");
    const l = layers.current;
    if (!ctx || !l) return;
    const out = l.base.width;
    ctx.drawImage(l.base, 0, 0);
    const cell = out / CELLS;
    for (let k = 0; k < Math.floor(shown.current); k++) {
      const c = order.current[k];
      const x = Math.floor((c % CELLS) * cell);
      const y = Math.floor(Math.floor(c / CELLS) * cell);
      const w = Math.ceil(cell);
      ctx.drawImage(l.full, x, y, w, w, x, y, w, w);
    }
  };

  // Sweep the revealed count toward 0 or all cells at a steady rate
  const animateTo = (target: number) => {
    cancelAnimationFrame(raf.current);
    if (prefersReducedMotion()) {
      shown.current = target;
      paint();
      return;
    }
    const perMs = (CELLS * CELLS) / REVEAL_MS;
    let last = performance.now();
    const frame = (now: number) => {
      const step = (now - last) * perMs;
      last = now;
      const cur = shown.current;
      shown.current = cur < target ? Math.min(target, cur + step) : Math.max(target, cur - step);
      paint();
      if (shown.current !== target) raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);
  };

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const out = Math.round(CSS_PX * (window.devicePixelRatio || 1));
    canvas.width = out;
    canvas.height = out;

    // Shuffle the cell order once per logo (stable per mark so it doesn't change between hovers)
    const r = rng(src.length * 7919);
    const cells = Array.from({ length: CELLS * CELLS }, (_, i) => i);
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }
    order.current = cells;

    const img = new Image();
    img.onload = () => {
      layers.current = { base: render(img, bg, out, true), full: render(img, bg, out, false) };
      paint();
    };
    img.src = src;
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <canvas
      ref={ref}
      onMouseEnter={() => animateTo(CELLS * CELLS)}
      onMouseLeave={() => animateTo(0)}
      className="block w-[44px] shrink-0 bg-black"
      style={{ aspectRatio: "1 / 1" }}
    />
  );
}

import { useEffect, useRef } from "react";
import { useTicker } from "./Triptych";

// Low-res framebuffer, same 3:2 panel as the other figures
const RW = 144;
const RH = 96;
// Crop of the source screenshot that leaves out the class legend in the corner
const SRC = { x: 150, y: 0, w: 1000, h: 667 };
// Sweep origin: the middle of the intersection, in framebuffer pixels
const CX = 70;
const CY = 42;
const SWEEP_MS = 3200;

interface Frame {
  lum: Float32Array;
  // Annotation boxes (saturated pixels) keep their colour; everything else is LiDAR grey
  box: Uint8Array;
  rgb: Uint8ClampedArray;
  angle: Float32Array;
}

function digitize(img: HTMLImageElement): Frame {
  const c = document.createElement("canvas");
  c.width = RW;
  c.height = RH;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, SRC.x, SRC.y, SRC.w, SRC.h, 0, 0, RW, RH);
  const { data } = ctx.getImageData(0, 0, RW, RH);
  const n = RW * RH;
  const lum = new Float32Array(n);
  const box = new Uint8Array(n);
  const rgb = new Uint8ClampedArray(n * 3);
  const angle = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const [r, g, b] = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
    lum[i] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    box[i] = Math.max(r, g, b) - Math.min(r, g, b) > 60 ? 1 : 0;
    // Posterise box colours to a handful of levels per channel
    rgb[i * 3] = Math.round(r / 64) * 64;
    rgb[i * 3 + 1] = Math.round(g / 64) * 64;
    rgb[i * 3 + 2] = Math.round(b / 64) * 64;
    angle[i] = Math.atan2(Math.floor(i / RW) - CY, (i % RW) - CX);
  }
  return { lum, box, rgb, angle };
}

/** The simulation player's intersection, digitized, with a LiDAR sweep painting the returns. */
export default function SimFigure() {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useRef<Frame | null>(null);
  const sweep = useRef(0);

  const draw = (beam: number) => {
    const ctx = ref.current?.getContext("2d");
    const f = frame.current;
    if (!ctx || !f) return;
    const img = ctx.createImageData(RW, RH);
    for (let i = 0; i < RW * RH; i++) {
      // How far behind the beam this pixel is, 0..2π; returns fade as the beam moves on
      let behind = (beam - f.angle[i]) % (2 * Math.PI);
      if (behind < 0) behind += 2 * Math.PI;
      const glow = Math.exp(-behind * 0.9);
      const row = Math.floor(i / RW);
      const scan = row % 2 ? 0.78 : 1;
      let r: number, g: number, b: number;
      if (f.box[i]) {
        const k = (0.85 + 0.35 * glow) * scan;
        [r, g, b] = [f.rgb[i * 3] * k, f.rgb[i * 3 + 1] * k, f.rgb[i * 3 + 2] * k];
      } else {
        // Quantise to five LiDAR greys, lifted where the beam just passed
        // Empty ground stays black so the sweep only lights real returns
        const v = f.lum[i] < 0.13 ? 0 : Math.min(0.999, Math.pow(f.lum[i], 0.7) * (0.9 + 1.3 * glow));
        const q = (Math.floor(v * 5) / 4) * 230 * scan;
        [r, g, b] = [q * 0.92 + 14, q + 14, q * 0.98 + 18];
      }
      img.data[i * 4] = r;
      img.data[i * 4 + 1] = g;
      img.data[i * 4 + 2] = b;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  };

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      frame.current = digitize(img);
      draw(sweep.current);
    };
    img.src = "/projects/vehicle-sim.png";
  }, []);

  useTicker(
    ref,
    15,
    () => {
      sweep.current = ((performance.now() % SWEEP_MS) / SWEEP_MS) * 2 * Math.PI;
      draw(sweep.current);
    },
    () => draw(sweep.current),
  );

  return (
    <canvas
      ref={ref}
      width={RW}
      height={RH}
      className="pixelated block w-full bg-black"
      style={{ aspectRatio: `${RW} / ${RH}` }}
    />
  );
}

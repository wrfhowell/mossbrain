import { useRef } from "react";
import { rng } from "../../lib/pixelScene";
import { useTicker } from "./Triptych";

// Low-res framebuffer, upscaled with hard pixels like an old handheld LCD
const RW = 240;
const RH = 160;
const CY = RH / 2;
const X0 = 8;
const X1 = RW - 8;
const TUBE_R = 7;
const PER_RIBBON = 7;

const BG: [number, number, number] = [18, 14, 22];
// Phosphor greens by how many strands overlap a pixel
const GREENS: [number, number, number][] = [
  [44, 64, 48],
  [86, 118, 84],
  [140, 170, 132],
  [196, 216, 186],
];
const PULSE: [number, number, number] = [236, 248, 224];
const GRID: [number, number, number] = [92, 88, 104];
const FRAME: [number, number, number] = [170, 164, 184];

// Each ribbon is one vital-sign channel, twisting as the model reweighs it
const RIBBONS = [
  { amp: 32, freq: 1.0, phase: 0.2, width: 11, twist: 2.2, turn: 0.0 },
  { amp: -27, freq: 1.0, phase: 0.5, width: 9, twist: -1.8, turn: 1.1 },
  { amp: 38, freq: 2.0, phase: 2.3, width: 12, twist: 2.8, turn: 0.6 },
  { amp: -36, freq: 2.0, phase: 1.1, width: 10, twist: -2.4, turn: 2.0 },
  { amp: 21, freq: 3.0, phase: 0.9, width: 8, twist: 1.6, turn: 2.7 },
  { amp: -19, freq: 3.0, phase: 2.0, width: 9, twist: -3.0, turn: 0.4 },
  { amp: 10, freq: 1.5, phase: 3.4, width: 7, twist: 1.2, turn: 1.6 },
];
const STRANDS = RIBBONS.length * PER_RIBBON;

// Three model layers, skewed as in the reference drawing
const PLANES = [0.34, 0.53, 0.72].map((t) => ({
  x: Math.round(X0 + t * (X1 - X0)),
  w: 17,
  top: 24,
  bottom: 122,
  skew: 14,
}));

const BEAT_MS = 1100;
const TRAVEL_MS = 1800;

const smooth = (v: number) => {
  const c = Math.min(1, Math.max(0, v));
  return c * c * (3 - 2 * c);
};

// 0 inside the vessel at either end, 1 where the ribbons are fully fanned out
const envelope = (t: number) => smooth((t - 0.03) / 0.3) * smooth((0.97 - t) / 0.3);

function strandY(i: number, t: number, time: number) {
  const r = RIBBONS[Math.floor(i / PER_RIBBON)];
  const s = ((i % PER_RIBBON) / (PER_RIBBON - 1)) * 2 - 1;
  // In the vessel, strands sit on a circular cross-section, so they bunch at the walls
  const tube = TUBE_R * Math.cos((Math.PI * (i + 0.5)) / STRANDS);
  const drift = 0.25 * Math.sin(time * 0.00035 + r.phase);
  const centre = r.amp * Math.sin(Math.PI * r.freq * t + r.phase * 0.15 + drift);
  const angle = r.turn + r.twist * Math.PI * t + time * 0.0002;
  const e = envelope(t);
  return CY + (1 - e) * tube + e * (centre + s * r.width * Math.cos(angle));
}

function draw(ctx: CanvasRenderingContext2D, time: number) {
  const hits = new Uint8Array(RW * RH);
  const pulse = new Uint8Array(RW * RH);
  const beat = (time % BEAT_MS) / TRAVEL_MS;

  for (let i = 0; i < STRANDS; i++) {
    let prev = -1;
    for (let x = X0; x <= X1; x++) {
      const t = (x - X0) / (X1 - X0);
      const y = Math.round(strandY(i, t, time));
      const lit = i % 3 === 0 && (Math.abs(t - beat) < 0.015 || Math.abs(t - (beat - 0.08)) < 0.015);
      // Fill vertical runs so steep sections stay connected
      const [a, b] = prev < 0 ? [y, y] : [Math.min(prev, y), Math.max(prev, y)];
      for (let yy = a; yy <= b; yy++) {
        if (yy < 0 || yy >= RH) continue;
        const k = yy * RW + x;
        if (hits[k] < 255) hits[k]++;
        if (lit) pulse[k] = 1;
      }
      prev = y;
    }
  }

  const img = ctx.createImageData(RW, RH);
  const put = (x: number, y: number, c: [number, number, number]) => {
    if (x < 0 || y < 0 || x >= RW || y >= RH) return;
    const k = (y * RW + x) * 4;
    img.data[k] = c[0];
    img.data[k + 1] = c[1];
    img.data[k + 2] = c[2];
  };
  for (let k = 0; k < RW * RH; k++) {
    const c = pulse[k] ? PULSE : hits[k] ? GREENS[Math.min(3, hits[k] - 1)] : BG;
    img.data[k * 4] = c[0];
    img.data[k * 4 + 1] = c[1];
    img.data[k * 4 + 2] = c[2];
    img.data[k * 4 + 3] = 255;
  }

  for (const p of PLANES) {
    for (let u = 0; u <= p.w; u++) {
      const dy = Math.round((u / p.w) * p.skew);
      for (let y = p.top; y <= p.bottom; y++) {
        const edge = u === 0 || u === p.w || y === p.top || y === p.bottom;
        if (edge) put(p.x + u, y + dy, FRAME);
        else if (u % 3 === 0 || (y - p.top) % 4 === 0) put(p.x + u, y + dy, GRID);
      }
      if (u % 3 === 0) put(p.x + u, p.bottom + dy + 2, FRAME);
    }
  }

  // Vessel mouths
  for (const x of [X0 - 1, X1 + 1]) for (let y = CY - TUBE_R; y <= CY + TUBE_R; y++) put(x, y, GREENS[3]);

  // Scanlines plus a little sensor grain
  const grain = rng(Math.floor(time / 80));
  for (let y = 0; y < RH; y++) {
    const dim = y % 2 ? 0.78 : 1;
    for (let x = 0; x < RW; x++) {
      const k = (y * RW + x) * 4;
      const n = dim * (0.94 + grain() * 0.12);
      img.data[k] *= n;
      img.data[k + 1] *= n;
      img.data[k + 2] *= n;
    }
  }
  ctx.putImageData(img, 0, 0);
}

/** A patient's vitals leave one vessel, are pulled apart and rewoven by a model's layers, and rejoin. */
export default function VesselFigure() {
  const ref = useRef<HTMLCanvasElement>(null);
  const render = (time: number) => {
    const ctx = ref.current?.getContext("2d");
    if (ctx) draw(ctx, time);
  };

  useTicker(ref, 12, () => render(performance.now()), () => render(0));

  return (
    <figure>
      <figcaption className="text-left">
        <b>Fig. 1.</b> Patient signals rewoven and rejoined, timed by heartbeat.
      </figcaption>
      {/* One cell of the same three-up grid the other figures use, so panels match in size */}
      <div className="grid grid-cols-3 gap-3 sm:gap-8">
        <canvas
          ref={ref}
          width={RW}
          height={RH}
          className="pixelated block w-full"
          style={{ aspectRatio: `${RW} / ${RH}`, background: `rgb(${BG.join(",")})` }}
        />
      </div>
    </figure>
  );
}

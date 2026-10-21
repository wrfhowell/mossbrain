import { useMemo, useRef } from "react";
import { PANEL_H, PANEL_W, blankPanel, putPx } from "../../lib/pixelScene";
import { useTicker } from "./Triptych";

// 2:1 flag inset on a black panel, same frame as the other figures
const FW = 64;
const FH = 32;
const FX = (PANEL_W - FW) / 2;
const FY = (PANEL_H - FH) / 2;
const BAND = FW / 4;

const RED: [number, number, number] = [214, 40, 52];
const WHITE: [number, number, number] = [244, 244, 240];
const BLUEPRINT: [number, number, number] = [34, 34, 40];
const CURSOR: [number, number, number] = [250, 226, 120];

const LEAF = [
  ".........#.........",
  "........###........",
  "...#....###....#...",
  "...##..#####..##...",
  "...###.#####.###...",
  "#..#############..#",
  "##.#############.##",
  ".#################.",
  "..###############..",
  "...#############...",
  "..###############..",
  ".#################.",
  "...#############...",
  ".....#########.....",
  ".......#####.......",
  ".........#.........",
  ".........#.........",
  ".........#.........",
];
const LEAF_X = Math.floor((FW - LEAF[0].length) / 2);
const LEAF_Y = Math.floor((FH - LEAF.length) / 2) + 1;

const PX_PER_TICK = 28;
const HOLD_TICKS = 60;

type Step = { x: number; y: number; c: [number, number, number] };

/** Build order like a plotter: red bands column by column, then the white field, then the leaf. */
function buildOrder(): Step[] {
  const steps: Step[] = [];
  for (let x = 0; x < FW; x++) {
    if (x >= BAND && x < FW - BAND) continue;
    for (let y = 0; y < FH; y++) steps.push({ x, y, c: RED });
  }
  for (let y = 0; y < FH; y++) for (let x = BAND; x < FW - BAND; x++) steps.push({ x, y, c: WHITE });
  LEAF.forEach((row, j) =>
    [...row].forEach((ch, i) => ch === "#" && steps.push({ x: LEAF_X + i, y: LEAF_Y + j, c: RED })),
  );
  return steps;
}

export default function FlagFigure() {
  const ref = useRef<HTMLCanvasElement>(null);
  const steps = useMemo(buildOrder, []);
  const run = useRef({ n: 0, hold: 0 });

  const draw = () => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    const img = blankPanel(ctx);
    // Faint dot grid where the flag will go
    for (let y = 0; y < FH; y++)
      for (let x = 0; x < FW; x++) if ((x + y) % 2 === 0) putPx(img, FX + x, FY + y, BLUEPRINT);
    const n = Math.min(run.current.n, steps.length);
    for (let k = 0; k < n; k++) putPx(img, FX + steps[k].x, FY + steps[k].y, steps[k].c);
    if (n < steps.length) putPx(img, FX + steps[n].x, FY + steps[n].y, CURSOR);
    ctx.putImageData(img, 0, 0);
  };

  const tick = () => {
    const r = run.current;
    if (r.n >= steps.length) {
      if (++r.hold > HOLD_TICKS) {
        r.n = 0;
        r.hold = 0;
      }
    } else {
      // The leaf is drawn slower so it reads as being traced
      r.n += r.n >= steps.length - LEAF.join("").split("#").length ? 3 : PX_PER_TICK;
    }
    draw();
  };

  const still = () => {
    run.current.n = steps.length;
    draw();
  };

  useTicker(ref, 30, tick, still);

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-8">
      <canvas
        ref={ref}
        width={PANEL_W}
        height={PANEL_H}
        className="pixelated block w-full bg-black"
        style={{ aspectRatio: `${PANEL_W} / ${PANEL_H}` }}
      />
    </div>
  );
}

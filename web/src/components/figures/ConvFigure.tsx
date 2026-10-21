import { useMemo, useRef, useState } from "react";
import {
  INSET_X,
  INSET_Y,
  PANEL_H,
  PANEL_W,
  SCENE_H,
  SCENE_W,
  blankPanel,
  luminance,
  makeScene,
  putPx,
} from "../../lib/pixelScene";
import Triptych, { useTicker } from "./Triptych";

const KERNELS: { name: string; w: number[] }[] = [
  { name: "sobel x", w: [-1, 0, 1, -2, 0, 2, -1, 0, 1] },
  { name: "sobel y", w: [-1, -2, -1, 0, 0, 0, 1, 2, 1] },
  { name: "laplacian", w: [0, 1, 0, 1, -4, 1, 0, 1, 0] },
  { name: "sharpen", w: [0, -1, 0, -1, 5, -1, 0, -1, 0] },
];
const POS_PER_TICK = 14;
const HOLD_TICKS = 20;

// Input quantised to 4 grey levels, like an old handheld LCD
const GREYS = [16, 82, 160, 236];
const grey = (v: number): [number, number, number] => {
  const g = GREYS[Math.min(3, Math.max(0, Math.floor(v * 4)))];
  return [g, g, g];
};

// Activation colormap: black -> deep blue -> sky -> white
function actColor(v: number): [number, number, number] {
  const t = Math.min(1, Math.max(0, v));
  if (t < 0.33) return [0, Math.round(t * 3 * 60), Math.round(t * 3 * 140)];
  if (t < 0.66) {
    const k = (t - 0.33) * 3;
    return [Math.round(92 * k), Math.round(60 + 96 * k), Math.round(140 + 88 * k)];
  }
  const k = (t - 0.66) * 3;
  return [Math.round(92 + 152 * k), Math.round(156 + 92 * k), Math.round(228 + 27 * k)];
}

/** A 3x3 kernel sweeps the input, writing an activation map as it goes. */
export default function ConvFigure() {
  const inputRef = useRef<HTMLCanvasElement>(null);
  const kernelRef = useRef<HTMLCanvasElement>(null);
  const outRef = useRef<HTMLCanvasElement>(null);
  const lum = useMemo(() => Array.from(makeScene(7), luminance), []);
  const state = useRef({ pos: 0, k: 0, hold: 0 });
  const [label, setLabel] = useState({ k: 0, x: 0, y: 0 });

  const at = (x: number, y: number) =>
    lum[Math.min(SCENE_H - 1, Math.max(0, y)) * SCENE_W + Math.min(SCENE_W - 1, Math.max(0, x))];

  const conv = (x: number, y: number, w: number[]) => {
    let s = 0;
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) s += at(x + i - 1, y + j - 1) * w[j * 3 + i];
    return s;
  };

  const draw = () => {
    const ic = inputRef.current?.getContext("2d");
    const kc = kernelRef.current?.getContext("2d");
    const oc = outRef.current?.getContext("2d");
    if (!ic || !kc || !oc) return;
    const { pos, k } = state.current;
    const { w, name } = KERNELS[k];
    const cx = pos % SCENE_W;
    const cy = Math.floor(pos / SCENE_W);
    const sharpen = name === "sharpen";

    // input + sliding window outline
    const iImg = blankPanel(ic);
    for (let y = 0; y < SCENE_H; y++)
      for (let x = 0; x < SCENE_W; x++) putPx(iImg, INSET_X + x, INSET_Y + y, grey(at(x, y)));
    for (let d = -2; d <= 2; d++) {
      for (const [dx, dy] of [[d, -2], [d, 2], [-2, d], [2, d]]) {
        putPx(iImg, INSET_X + cx + dx, INSET_Y + cy + dy, [250, 226, 120]);
      }
    }
    ic.putImageData(iImg, 0, 0);

    // magnified patch ⊛ kernel
    const kImg = blankPanel(kc);
    const cell = 11;
    const top = Math.floor((PANEL_H - cell * 3) / 2);
    const left = 8;
    const right = PANEL_W - 8 - cell * 3;
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < 3; i++) {
        const v = at(cx + i - 1, cy + j - 1);
        const wv = w[j * 3 + i];
        const mag = Math.min(1, Math.abs(wv) / 4);
        const kcol: [number, number, number] =
          wv === 0 ? [36, 36, 36] : wv > 0 ? actColor(0.45 + mag * 0.55) : [Math.round(120 + 94 * mag), 40, 62];
        for (let yy = 1; yy < cell; yy++)
          for (let xx = 1; xx < cell; xx++) {
            putPx(kImg, left + i * cell + xx, top + j * cell + yy, grey(v));
            putPx(kImg, right + i * cell + xx, top + j * cell + yy, kcol);
          }
      }
    }
    const mid = Math.floor(PANEL_W / 2);
    const midY = Math.floor(PANEL_H / 2);
    for (let d = -2; d <= 2; d++) {
      putPx(kImg, mid + d, midY + d, [200, 200, 200]);
      putPx(kImg, mid + d, midY - d, [200, 200, 200]);
    }
    kc.putImageData(kImg, 0, 0);

    // activation map written up to the cursor
    const oImg = blankPanel(oc);
    for (let p = 0; p <= pos && p < SCENE_W * SCENE_H; p++) {
      const x = p % SCENE_W;
      const y = Math.floor(p / SCENE_W);
      const v = conv(x, y, w);
      putPx(oImg, INSET_X + x, INSET_Y + y, actColor(sharpen ? v : Math.abs(v) * 0.9));
    }
    oc.putImageData(oImg, 0, 0);
    setLabel({ k, x: cx, y: cy });
  };

  const tick = () => {
    const s = state.current;
    const total = SCENE_W * SCENE_H;
    if (s.pos >= total - 1) {
      if (++s.hold > HOLD_TICKS) {
        s.pos = 0;
        s.hold = 0;
        s.k = (s.k + 1) % KERNELS.length;
      }
    } else {
      s.pos = Math.min(total - 1, s.pos + POS_PER_TICK);
    }
    draw();
  };

  const still = () => {
    state.current.pos = SCENE_W * SCENE_H - 1;
    draw();
  };

  useTicker(inputRef, 30, tick, still);

  return (
    <Triptych
      panels={[
        { ref: inputRef, caption: <>input · ({label.x}, {label.y})</> },
        { ref: kernelRef, caption: <>patch ⊛ {KERNELS[label.k].name}</> },
        { ref: outRef, caption: "activation" },
      ]}
    >
      <b>Fig. 3.</b> One convolutional layer.
    </Triptych>
  );
}

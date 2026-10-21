import { useMemo, useRef, useState } from "react";
import {
  INSET_X,
  INSET_Y,
  PALETTE,
  SCENE_H,
  SCENE_W,
  blankPanel,
  luminance,
  makeScene,
  putPx,
  rng,
} from "../../lib/pixelScene";
import Triptych, { useTicker } from "./Triptych";

const MAX_STEP = 600;
const STEP_PER_TICK = 5;
const HOLD_TICKS = 30;
const DIFF_LO: [number, number, number] = [93, 156, 126];
const DIFF_HI: [number, number, number] = [232, 228, 106];

// Per-pixel error rate decays like a post-training loss curve
const errRate = (step: number) => 0.92 * Math.exp(-step / 85) + 0.003;

/** Policy learns to reproduce a reference frame; the diff shrinks to a few stray pixels. */
export default function TrainingFigure() {
  const policyRef = useRef<HTMLCanvasElement>(null);
  const diffRef = useRef<HTMLCanvasElement>(null);
  const refRef = useRef<HTMLCanvasElement>(null);
  const scene = useMemo(() => makeScene(7), []);
  const n = SCENE_W * SCENE_H;

  const run = useRef({ step: 0, hold: 0, seed: 1, u: new Float32Array(n), noise: new Uint8Array(n) });
  const [caption, setCaption] = useState({ step: 0, diff: n });

  const reseed = () => {
    const r = rng(run.current.seed * 9973);
    for (let i = 0; i < n; i++) {
      run.current.u[i] = r();
      run.current.noise[i] = Math.floor(r() * PALETTE.length);
    }
  };

  const draw = () => {
    const pc = policyRef.current?.getContext("2d");
    const dc = diffRef.current?.getContext("2d");
    const rc = refRef.current?.getContext("2d");
    if (!pc || !dc || !rc) return;
    const { step, u, noise } = run.current;
    const err = errRate(step);
    const flicker = rng(step * 31 + run.current.seed);
    const pImg = blankPanel(pc);
    const dImg = blankPanel(dc);
    const rImg = blankPanel(rc);
    let wrong = 0;
    for (let y = 0; y < SCENE_H; y++) {
      for (let x = 0; x < SCENE_W; x++) {
        const i = y * SCENE_W + x;
        const truth = scene[i];
        let out = truth;
        if (u[i] < err) {
          if (flicker() < 0.15) noise[i] = Math.floor(flicker() * PALETTE.length);
          out = noise[i];
        }
        putPx(rImg, INSET_X + x, INSET_Y + y, PALETTE[truth]);
        putPx(pImg, INSET_X + x, INSET_Y + y, PALETTE[out]);
        if (out !== truth) {
          wrong++;
          const big = Math.abs(luminance(out) - luminance(truth)) > 0.35;
          putPx(dImg, INSET_X + x, INSET_Y + y, big ? DIFF_HI : DIFF_LO);
        }
      }
    }
    pc.putImageData(pImg, 0, 0);
    dc.putImageData(dImg, 0, 0);
    rc.putImageData(rImg, 0, 0);
    setCaption({ step, diff: wrong });
  };

  const tick = () => {
    const r = run.current;
    if (r.step === 0 && r.hold === 0 && r.u[0] === 0) reseed();
    if (r.step >= MAX_STEP) {
      if (++r.hold > HOLD_TICKS) {
        r.step = 0;
        r.hold = 0;
        r.seed++;
        reseed();
      }
    } else {
      r.step += STEP_PER_TICK;
    }
    draw();
  };

  const still = () => {
    reseed();
    run.current.step = MAX_STEP;
    draw();
  };

  useTicker(policyRef, 12, tick, still);

  return (
    <Triptych
      panels={[
        {
          ref: policyRef,
          caption: <>policy · step {String(caption.step).padStart(3, "0")}</>,
        },
        { ref: diffRef, caption: <>diff · {caption.diff} px</> },
        { ref: refRef, caption: "reference" },
      ]}
    >
      <b>Fig. 2.</b> Small post-trained repainting.
    </Triptych>
  );
}

import { useRef } from "react";
import { useTicker } from "./Triptych";

// Low-res framebuffer, same 3:2 panel as the other figures
const RW = 192;
const RH = 128;
const FONT = '8px "IBM Plex Mono", ui-monospace, monospace';
const HOLD_TICKS = 16;

const RAW = "rgb(110, 110, 118)";
const PASS = "rgb(170, 210, 160)";
const PHI = "rgb(214, 52, 79)";
const CURSOR = "rgb(250, 226, 120)";

// A made-up visit transcript; tagged spans are the PHI the encoder should catch
type Token = { text: string; tag?: string };
const LINES: Token[][] = [
  [{ text: "pt" }, { text: "john miller", tag: "[NAME]" }, { text: "," }, { text: "54", tag: "[AGE]" }],
  [{ text: "seen" }, { text: "03/14", tag: "[DATE]" }, { text: "at" }, { text: "st. mary's", tag: "[LOC]" }],
  [{ text: "mrn" }, { text: "448-21-907", tag: "[ID]" }, { text: "." }, { text: "call" }],
  [{ text: "604-555-0192", tag: "[PHONE]" }, { text: "re" }, { text: "labs" }],
];
const TOTAL = LINES.reduce((n, l) => n + l.length, 0);

/** A tiny encoder reads an ASR transcript token by token and masks the PHI it finds. */
export default function DeidFigure() {
  const ref = useRef<HTMLCanvasElement>(null);
  const run = useRef({ k: 0, hold: 0 });

  const draw = () => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, RW, RH);
    ctx.font = FONT;
    ctx.textBaseline = "top";

    ctx.fillStyle = RAW;
    ctx.fillText("asr > deid", 10, 12);

    const space = ctx.measureText(" ").width;
    let idx = 0;
    LINES.forEach((line, row) => {
      let x = 10;
      const y = 36 + row * 20;
      for (const tok of line) {
        const done = idx < run.current.k;
        const here = idx === run.current.k;
        const text = done && tok.tag ? tok.tag : tok.text;
        const w = ctx.measureText(text).width;
        if (here) {
          ctx.fillStyle = CURSOR;
          ctx.fillRect(x - 1, y - 2, w + 2, 12);
          ctx.fillStyle = "#000";
        } else {
          ctx.fillStyle = !done ? RAW : tok.tag ? PHI : PASS;
        }
        ctx.fillText(text, x, y);
        x += w + (tok.text === "," || tok.text === "." ? space * 0.5 : space);
        idx++;
      }
    });

    // Scanlines
    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
    for (let y = 1; y < RH; y += 2) ctx.fillRect(0, y, RW, 1);
  };

  const tick = () => {
    const r = run.current;
    if (r.k >= TOTAL) {
      if (++r.hold > HOLD_TICKS) {
        r.k = 0;
        r.hold = 0;
      }
    } else {
      r.k++;
    }
    draw();
  };

  const still = () => {
    run.current.k = TOTAL;
    draw();
  };

  useTicker(ref, 4, tick, still);

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

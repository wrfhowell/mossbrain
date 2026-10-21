import { useEffect, useRef } from "react";
import { useTicker } from "./Triptych";

// Small square badge, upscaled with hard pixels like the other figures
const SIZE = 20;
const INSET = 1;
const LEVELS = 6;

type RGB = [number, number, number];

// Real logos, digitized at runtime. `bg` sits behind transparent marks so dark logos stay visible.
const LOGOS = {
  bamru: { src: "/teams/bamru.png", bg: [255, 255, 255] as RGB },
  commure: { src: "/teams/commure.png", bg: [0, 0, 0] as RGB },
  genesys: { src: "/teams/genesys.png", bg: [0, 0, 0] as RGB },
  rivian: { src: "/teams/rivian.png", bg: [236, 232, 220] as RGB },
  launchpad: { src: "/teams/launchpad.png", bg: [0, 0, 0] as RGB },
};

// No public logo found for Kinetic yet, so it gets a drawn pixel mark
const KINETIC = {
  colors: { g: [120, 220, 170], d: [44, 100, 78] } as Record<string, RGB>,
  rows: [
    "..dddd..gg...gg.",
    "........gg..gg..",
    ".dddddd.gg.gg...",
    "........gggg....",
    "..ddddd.ggg.....",
    "........gggg....",
    ".dddddd.gg.gg...",
    "........gg..gg..",
    "..dddd..gg...gg.",
  ],
};

export type TeamMark = keyof typeof LOGOS | "kinetic";

const posterize = (v: number) => Math.round((v / 255) * (LEVELS - 1)) * (255 / (LEVELS - 1));

function drawKinetic(px: Uint8ClampedArray) {
  const ox = Math.floor((SIZE - KINETIC.rows[0].length) / 2);
  const oy = Math.floor((SIZE - KINETIC.rows.length) / 2);
  KINETIC.rows.forEach((row, j) =>
    [...row].forEach((ch, i) => {
      const c = KINETIC.colors[ch];
      if (!c) return;
      px.set(c, ((oy + j) * SIZE + ox + i) * 3);
    }),
  );
}

/** Downsample a logo onto its background and posterize it into a few colour levels. */
function digitize(img: HTMLImageElement, bg: RGB, px: Uint8ClampedArray) {
  const c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = `rgb(${bg.join(",")})`;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.drawImage(img, INSET, INSET, SIZE - 2 * INSET, SIZE - 2 * INSET);
  const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
  for (let i = 0; i < SIZE * SIZE; i++) {
    px[i * 3] = posterize(data[i * 4]);
    px[i * 3 + 1] = posterize(data[i * 4 + 1]);
    px[i * 3 + 2] = posterize(data[i * 4 + 2]);
  }
}

/** A team's logo as a pixel badge, with a bright scan line rolling down it now and then. */
export default function TeamLogo({ mark }: { mark: TeamMark }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pixels = useRef<Uint8ClampedArray | null>(null);
  const frame = useRef(0);

  const draw = (scanRow: number) => {
    const ctx = ref.current?.getContext("2d");
    const px = pixels.current;
    if (!ctx || !px) return;
    const img = ctx.createImageData(SIZE, SIZE);
    for (let i = 0; i < SIZE * SIZE; i++) {
      const y = Math.floor(i / SIZE);
      const lift = y === scanRow ? 1.3 : y % 2 ? 0.82 : 1;
      img.data[i * 4] = Math.min(255, px[i * 3] * lift);
      img.data[i * 4 + 1] = Math.min(255, px[i * 3 + 1] * lift);
      img.data[i * 4 + 2] = Math.min(255, px[i * 3 + 2] * lift);
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  };

  useEffect(() => {
    const px = new Uint8ClampedArray(SIZE * SIZE * 3);
    if (mark === "kinetic") {
      drawKinetic(px);
      pixels.current = px;
      draw(-1);
      return;
    }
    const { src, bg } = LOGOS[mark];
    const img = new Image();
    img.onload = () => {
      digitize(img, bg, px);
      pixels.current = px;
      draw(-1);
    };
    img.src = src;
  }, [mark]);

  // The scan line spends most of its cycle off-canvas so it reads as an occasional glint
  useTicker(
    ref,
    10,
    () => draw((frame.current++ % (SIZE * 3)) - SIZE),
    () => draw(-1),
  );

  return (
    <canvas
      ref={ref}
      width={SIZE}
      height={SIZE}
      className="pixelated block w-[44px] shrink-0 bg-black"
      style={{ aspectRatio: "1 / 1" }}
    />
  );
}

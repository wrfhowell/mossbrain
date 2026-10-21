import { useEffect, useRef } from "react";

// Small square badge, upscaled with hard pixels like the other figures
const SIZE = 20;
const INSET = 1;
const LEVELS = 6;

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

/** A team's logo, downsampled and posterized into a still pixel badge with scanlines. */
export default function TeamLogo({ mark }: { mark: TeamMark }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const { src, bg } = LOGOS[mark];
    const img = new Image();
    img.onload = () => {
      const ctx = ref.current?.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = `rgb(${bg.join(",")})`;
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.drawImage(img, INSET, INSET, SIZE - 2 * INSET, SIZE - 2 * INSET);
      const frame = ctx.getImageData(0, 0, SIZE, SIZE);
      const d = frame.data;
      for (let i = 0; i < SIZE * SIZE; i++) {
        const dim = Math.floor(i / SIZE) % 2 ? 0.82 : 1;
        d[i * 4] = posterize(d[i * 4]) * dim;
        d[i * 4 + 1] = posterize(d[i * 4 + 1]) * dim;
        d[i * 4 + 2] = posterize(d[i * 4 + 2]) * dim;
      }
      ctx.putImageData(frame, 0, 0);
    };
    img.src = src;
  }, [mark]);

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

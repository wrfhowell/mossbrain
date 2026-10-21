// Procedural pixel-art mountain scene used as the "reference" image for the
// figure animations. Everything is palette-indexed so diffs are exact.

export const SCENE_W = 64;
export const SCENE_H = 44;

// Panel canvas: scene is inset on a black field, like an emulator frame.
export const PANEL_W = 96;
export const PANEL_H = 64;
export const INSET_X = (PANEL_W - SCENE_W) / 2;
export const INSET_Y = (PANEL_H - SCENE_H) / 2;

export const PALETTE: [number, number, number][] = [
  [0, 0, 0], // 0 void
  [92, 156, 228], // 1 sky
  [168, 208, 246], // 2 pale sky
  [244, 248, 255], // 3 snow
  [52, 49, 47], // 4 rock shadow
  [92, 86, 82], // 5 rock lit
  [28, 40, 74], // 6 night water
  [214, 52, 79], // 7 cloak
  [44, 102, 76], // 8 pine
  [250, 226, 120], // 9 star
];

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

export function makeScene(seed = 7): Uint8Array {
  const r = rng(seed);
  const px = new Uint8Array(SCENE_W * SCENE_H);
  const set = (x: number, y: number, c: number) => {
    if (x >= 0 && x < SCENE_W && y >= 0 && y < SCENE_H) px[y * SCENE_W + x] = c;
  };

  // Sky: banded + ordered dither between pale and deep blue
  for (let y = 0; y < SCENE_H; y++) {
    for (let x = 0; x < SCENE_W; x++) {
      const t = y / SCENE_H;
      const dither = ((x + y) & 1) === 0;
      set(x, y, t < 0.35 ? 1 : t < 0.55 ? (dither ? 2 : 1) : 2);
    }
  }
  for (let i = 0; i < 6; i++) set(Math.floor(r() * SCENE_W), Math.floor(r() * 12), 9);

  // Peaks: jagged ridge from overlapping triangles
  const peaks = [
    { x: 18, y: 8, w: 22 },
    { x: 42, y: 13, w: 20 },
    { x: 56, y: 18, w: 14 },
    { x: 4, y: 20, w: 12 },
  ];
  const ridge = new Array(SCENE_W).fill(SCENE_H);
  for (const p of peaks) {
    for (let x = 0; x < SCENE_W; x++) {
      const h = p.y + Math.abs(x - p.x) * (SCENE_H / p.w / 1.6) + (r() < 0.3 ? 1 : 0);
      ridge[x] = Math.min(ridge[x], Math.round(h));
    }
  }
  for (let x = 0; x < SCENE_W; x++) {
    // which peak owns this column -> lit on the left face, shadow on the right
    let owner = peaks[0];
    for (const p of peaks) {
      const h = p.y + Math.abs(x - p.x) * (SCENE_H / p.w / 1.6);
      if (Math.abs(h - ridge[x]) < 1.5) owner = p;
    }
    const lit = x < owner.x;
    for (let y = ridge[x]; y < SCENE_H; y++) {
      const depth = y - ridge[x];
      const snowline = 4 + Math.floor(r() * 3);
      set(x, y, depth < snowline && y < 26 ? 3 : lit ? 5 : 4);
    }
  }

  // Lake band
  for (let y = 34; y < 38; y++)
    for (let x = 0; x < SCENE_W; x++) set(x, y, ((x * 3 + y) % 7 === 0) ? 2 : 6);

  // Pines along the shore
  for (let i = 0; i < 9; i++) {
    const tx = 2 + Math.floor(r() * (SCENE_W - 4));
    const th = 4 + Math.floor(r() * 4);
    for (let k = 0; k < th; k++) {
      const w = Math.floor((k + 1) / 2);
      for (let dx = -w; dx <= w; dx++) set(tx + dx, 34 - th + k + 1, 8);
    }
  }

  // Ground
  for (let y = 38; y < SCENE_H; y++)
    for (let x = 0; x < SCENE_W; x++) set(x, y, ((x + y * 2) % 5 === 0) ? 5 : 4);

  // Tiny wizard: hat, cloak, staff
  const wx = 30;
  const wy = 38;
  set(wx, wy - 6, 7);
  set(wx - 1, wy - 5, 7); set(wx, wy - 5, 7); set(wx + 1, wy - 5, 7);
  set(wx, wy - 4, 3);
  for (let k = 0; k < 3; k++) { set(wx - 1, wy - 3 + k, 7); set(wx, wy - 3 + k, 7); set(wx + 1, wy - 3 + k, 7); }
  for (let k = 0; k < 6; k++) set(wx + 3, wy - 5 + k, 5);
  set(wx + 3, wy - 6, 9);

  return px;
}

export function luminance(c: number): number {
  const [r, g, b] = PALETTE[c];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function blankPanel(ctx: CanvasRenderingContext2D): ImageData {
  const img = ctx.createImageData(PANEL_W, PANEL_H);
  for (let i = 3; i < img.data.length; i += 4) img.data[i] = 255;
  return img;
}

export function putPx(img: ImageData, x: number, y: number, rgb: [number, number, number]) {
  if (x < 0 || y < 0 || x >= PANEL_W || y >= PANEL_H) return;
  const i = (y * PANEL_W + x) * 4;
  img.data[i] = rgb[0];
  img.data[i + 1] = rgb[1];
  img.data[i + 2] = rgb[2];
  img.data[i + 3] = 255;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

# Photo Graph: Replace PhotoMosaic with Interactive Force-Directed Image Graph

## Summary

Replace the 5-column photo grid (`PhotoMosaic.tsx`) with an interactive force-directed graph of floating square image thumbnails, inspired by Obsidian/Quartz's notes graph. Images are small nodes connected by arbitrary edges. The graph supports drag, click, pan/zoom, and hover-magnification. It uses the site's existing warm parchment color scheme and lives directly on the page (no box/border).

## Library

**`react-force-graph-2d`** -- a React wrapper around `force-graph` (which uses `d3-force` internally). Provides force-directed layout, canvas rendering, drag/zoom/pan, and custom node drawing via a single `<ForceGraph2D>` component.

Install: `npm install react-force-graph-2d` (in the `web` workspace).

## Data

### Source

Same API as the current mosaic: `fetchMediaSample()` returns `Media[]` (up to 200 items). Each `Media` has `id`, `url`, `width`, `height`, and optional `entry_id`.

### Graph transformation

Transform `Media[]` into `{ nodes, links }`:

- **Nodes:** One per `Media` item. Shape: `{ id: string, url: string, entry_id?: string }`.
- **Links:** Each node gets 2-4 random connections to other nodes. Edge targets are chosen via a seeded shuffle (stable per session -- does not re-randomize on re-render). Total edges ~= `nodes.length * 1.5` (some overlap from bidirectional picks).

Edge generation pseudocode:

```
for each node:
  pick random count in [2, 4]
  pick that many random other nodes (no self-links, no duplicate edges)
  add link { source: node.id, target: other.id }
deduplicate by sorted (source, target) pair
```

## Component: `PhotoGraph.tsx`

New file at `web/src/components/PhotoGraph.tsx`. Replaces `PhotoMosaic` in `Layout.tsx`.

### Rendering

- `<ForceGraph2D>` fills its container (auto-resizes).
- **Transparent background** -- no `backgroundColor` set, inherits `--color-base` from the page.
- **Node rendering** via `nodeCanvasObject`: draw each node as a small **square** image thumbnail.
  - Default size: ~16px half-width (32x32px square).
  - Load images into an `Image()` cache (keyed by URL). Draw `ctx.drawImage()` as a square. While loading, draw a placeholder square filled with `--color-surface-2`.
  - Subtle 1px border in `--color-border`.
- **Edge rendering**: thin lines (width ~0.5px) in `--color-border` at 0.3 alpha. No arrows.
- **Node hit area** via `nodePointerAreaPaint`: square matching the node size.

### Interactions

| Action | Behavior |
|--------|----------|
| **Hover** | Magnify hovered node: scale from 16px to 32px half-width (smooth by redrawing at larger size in `nodeCanvasObject` when `node === hoverNode`). Subtle glow: `ctx.shadowColor` set to `--color-border-light`, `shadowBlur: 8`. |
| **Click** | Set `?highlight=<entry_id>` on URL params (same as current mosaic). Feed scrolls to that entry. |
| **Drag** | Built-in from react-force-graph. Drag any node, physics re-settles. |
| **Pan/Zoom** | Built-in. Scroll to zoom, drag background to pan. |

### Force simulation parameters

- `d3Force('charge').strength(-30)` -- gentle repulsion, keeps nodes from overlapping but stays compact.
- `d3Force('link').distance(50)` -- short links for moderate density.
- `d3AlphaDecay(0.05)` -- settles reasonably fast on load.
- `cooldownTicks(100)` -- stop simulation after 100 ticks to save CPU.
- `d3Force('center')` -- center the graph in the viewport.

These are starting values; will tune visually.

### Image preloading

Maintain a `Map<string, HTMLImageElement>` ref. On data load, begin preloading all image URLs. The `nodeCanvasObject` checks the map: if loaded, draws the image; if not, draws a `--color-surface-2` placeholder square.

### Sizing

- **Desktop (sidebar):** Fills the 340px aside column. Height: `400px` (or a prop).
- **Mobile:** Full container width, height `300px`.
- The `<ForceGraph2D>` component accepts `width` and `height` props. Use a `ResizeObserver` on the container div (or a simple ref + state) to pass dynamic dimensions.

## Layout integration

In `Layout.tsx`:

- Replace `import PhotoMosaic from "./PhotoMosaic"` with `import PhotoGraph from "./PhotoGraph"`.
- Replace both `<PhotoMosaic />` instances with `<PhotoGraph />`.
- Remove the "shuffle" button header that was part of PhotoMosaic (the graph doesn't need it).

`PhotoMosaic.tsx` is kept in the codebase but no longer imported (can be deleted later).

## Color scheme mapping

| Element | CSS variable | Hex |
|---------|-------------|-----|
| Page background (transparent canvas) | `--color-base` | #f7efe4 |
| Node border | `--color-border` | #D8D0BE |
| Node placeholder fill | `--color-surface-2` | #EAE2D0 |
| Edge stroke | `--color-border` at 0.3 alpha | #D8D0BE4D |
| Hover glow | `--color-border-light` | #CCC4B2 |

Colors are read from CSS custom properties at runtime (via `getComputedStyle`) so they stay in sync with the theme.

## Files changed

| File | Change |
|------|--------|
| `web/src/components/PhotoGraph.tsx` | **New.** Force-directed image graph component. |
| `web/src/components/Layout.tsx` | Swap `PhotoMosaic` import/usage for `PhotoGraph`. |
| `web/package.json` | Add `react-force-graph-2d` dependency. |

## Out of scope

- Meaningful edge connections (by label, date, etc.) -- edges are random for now.
- 3D rendering.
- Search/filter within the graph.
- Node labels/text overlays.
- Deleting `PhotoMosaic.tsx` (kept as dead code for now).

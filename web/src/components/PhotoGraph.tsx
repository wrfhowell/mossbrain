import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ForceGraphMethods, NodeObject } from "react-force-graph-2d";
import ForceGraph2D from "react-force-graph-2d";
import { useSearchParams } from "react-router-dom";
import { fetchMediaSample } from "../lib/api";
import type { Media } from "../types";

interface GraphNode {
  id: string;
  url: string;
  entry_id?: string;
}

interface GraphLink {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function buildGraph(media: Media[], seed: number): GraphData {
  const rand = seededRandom(seed);
  const nodes: GraphNode[] = media.map((m) => ({
    id: m.id,
    url: m.url,
    entry_id: m.entry_id,
  }));

  if (nodes.length < 2) return { nodes, links: [] };

  const edgeSet = new Set<string>();
  const links: GraphLink[] = [];

  const edgeKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

  for (const node of nodes) {
    const count = 2 + Math.floor(rand() * 3); // 2-4 connections
    const others = nodes.filter((n) => n.id !== node.id);

    // Fisher-Yates partial shuffle for picking `count` random others
    for (let i = 0; i < Math.min(count, others.length); i++) {
      const j = i + Math.floor(rand() * (others.length - i));
      [others[i], others[j]] = [others[j], others[i]];
      const key = edgeKey(node.id, others[i].id);
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        links.push({ source: node.id, target: others[i].id });
      }
    }
  }

  return { nodes, links };
}

function getCssColor(varName: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return val || fallback;
}

const NODE_HALF_SIZE = 5;
const NODE_HOVER_HALF_SIZE = 9;
const LERP_SPEED = 0.15;

export default function PhotoGraph() {
  const [media, setMedia] = useState<Media[]>([]);
  const [, setParams] = useSearchParams();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [imagesLoaded, setImagesLoaded] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods<GraphNode> | undefined>(undefined);
  const imageCache = useRef(new Map<string, HTMLImageElement>());
  const hoverNodeId = useRef<string | null>(null);
  const nodeSizes = useRef(new Map<string, number>());

  // Stable seed per component mount (session-stable)
  const seed = useMemo(() => Date.now(), []);

  const graphData = useMemo<GraphData>(() => {
    if (media.length === 0) return { nodes: [], links: [] };
    return buildGraph(media, seed);
  }, [media, seed]);

  // Resolve CSS colors once
  const colors = useMemo(
    () => ({
      border: getCssColor("--color-border", "#D8D0BE"),
      surface2: getCssColor("--color-surface-2", "#EAE2D0"),
      borderLight: getCssColor("--color-border-light", "#CCC4B2"),
    }),
    [],
  );

  // Fetch media
  useEffect(() => {
    fetchMediaSample()
      .then(setMedia)
      .catch(() => {});
  }, []);

  // Preload images -- bump counter on load to trigger canvas redraw
  useEffect(() => {
    for (const m of media) {
      if (!imageCache.current.has(m.url)) {
        const img = new Image();
        img.onload = () => setImagesLoaded((n) => n + 1);
        img.src = m.url;
        imageCache.current.set(m.url, img);
      }
    }
  }, [media]);

  // ResizeObserver for dynamic sizing; re-run when media arrives so
  // the ref is attached to a real DOM node.
  const hasMedia = media.length > 0;
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({
            width: Math.round(width),
            height: Math.round(height),
          });
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasMedia]);

  // Configure forces after graph mounts
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    const charge = fg.d3Force("charge");
    if (charge && "strength" in charge) {
      (charge as any).strength(-28);
    }
    const link = fg.d3Force("link");
    if (link && "distance" in link) {
      (link as any).distance(28);
    }
  }, [graphData]);

  const handleNodeClick = useCallback(
    (node: NodeObject<GraphNode>) => {
      if (node.entry_id) {
        setParams((prev) => {
          prev.set("highlight", String(node.entry_id));
          return prev;
        });
      }
    },
    [setParams],
  );

  const handleNodeHover = useCallback((node: NodeObject<GraphNode> | null) => {
    hoverNodeId.current = node?.id ?? null;
  }, []);

  const nodeCanvasObject = useCallback(
    (
      node: NodeObject<GraphNode>,
      ctx: CanvasRenderingContext2D,
      globalScale: number,
    ) => {
      const id = node.id as string;
      const isHovered = hoverNodeId.current === id;
      const target = isHovered ? NODE_HOVER_HALF_SIZE : NODE_HALF_SIZE;
      const current = nodeSizes.current.get(id) ?? NODE_HALF_SIZE;
      const halfSize = current + (target - current) * LERP_SPEED;
      nodeSizes.current.set(id, halfSize);

      const size = halfSize * 2;
      const x = node.x ?? 0;
      const y = node.y ?? 0;

      ctx.save();

      if (halfSize > NODE_HALF_SIZE + 0.5) {
        ctx.shadowColor = colors.borderLight;
        ctx.shadowBlur =
          6 *
          ((halfSize - NODE_HALF_SIZE) /
            (NODE_HOVER_HALF_SIZE - NODE_HALF_SIZE));
      }

      ctx.beginPath();
      ctx.arc(x, y, halfSize, 0, 2 * Math.PI);
      ctx.clip();

      const img = imageCache.current.get(node.url ?? "");
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, x - halfSize, y - halfSize, size, size);
      } else {
        ctx.fillStyle = colors.surface2;
        ctx.fill();
      }

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1 / globalScale;
      ctx.stroke();

      ctx.restore();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colors, imagesLoaded],
  );

  const nodePointerAreaPaint = useCallback(
    (
      node: NodeObject<GraphNode>,
      color: string,
      ctx: CanvasRenderingContext2D,
    ) => {
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, NODE_HALF_SIZE, 0, 2 * Math.PI);
      ctx.fill();
    },
    [],
  );

  const linkColor = useMemo(() => {
    const hex = getCssColor("--color-border", "#D8D0BE");
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},0.75)`;
  }, []);

  const ready = media.length > 0 && dimensions.width > 0 && dimensions.height > 0;

  if (media.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden"
    >
      {ready && <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        nodeCanvasObject={nodeCanvasObject}
        nodeCanvasObjectMode={() => "replace"}
        nodePointerAreaPaint={nodePointerAreaPaint}
        nodeLabel=""
        linkColor={() => linkColor}
        linkWidth={0.8}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        d3AlphaDecay={0.05}
        cooldownTicks={100}
        enableNodeDrag={true}
        enableZoomInteraction={false}
        enablePanInteraction={true}
        autoPauseRedraw={false}
      />}
    </div>
  );
}

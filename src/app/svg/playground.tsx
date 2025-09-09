"use client";
import { useCallback, useEffect, useRef, useState } from "react";

interface Point { x: number; y: number }

function useMouseWithin() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [point, setPoint] = useState<Point>({ x: 0.5, y: 0.5 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function onMove(e: PointerEvent) {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setPoint({ x: Math.min(Math.max(x, 0), 1), y: Math.min(Math.max(y, 0), 1) });
    }
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);
  return { ref, point } as const;
}

const palette = [
  { id: "fuchsia", from: "#f0abfc", to: "#c026d3" },
  { id: "cyan", from: "#67e8f9", to: "#0891b2" },
  { id: "amber", from: "#fde68a", to: "#d97706" },
];

function generatePath(progress: number) {
  // Simple blob path using sinusoidal offsets
  const r = 120;
  const c = 150;
  const wobble = (angle: number) => {
    const base = r + Math.sin(progress * 4 + angle * 3) * 18 + Math.cos(progress * 2 + angle * 5) * 12;
    return base;
  };
  const points: string[] = [];
  const steps = 12;
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const rad = wobble(t);
    const x = c + Math.cos(t) * rad;
    const y = c + Math.sin(t) * rad;
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(" ") + " Z";
}

export default function SvgPlayground() {
  const { ref, point } = useMouseWithin();
  const [time, setTime] = useState(0);
  const [grad, setGrad] = useState<string>(palette[0]?.id ?? "fuchsia");
  const [showGrid, setShowGrid] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let raf: number;
    function tick() {
      setTime(t => (t + 0.015));
      raf = requestAnimationFrame(tick);
    }
    if (!paused) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  const g = palette.find(p => p.id === grad)!;
  const blobPath = generatePath(time);
  const focusX = (point.x * 100).toFixed(2);
  const focusY = (point.y * 100).toFixed(2);

  const copySVG = useCallback(() => {
    const svgEl = document.getElementById("playground-svg");
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const markup = serializer.serializeToString(svgEl);
    navigator.clipboard.writeText(markup).catch((err) => {
      console.warn("Clipboard copy failed", err);
    });
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 items-center text-xs">
        <div className="flex items-center gap-2">
          <span className="text-white/40 uppercase tracking-wide">Gradient</span>
          <div className="flex gap-2">
            {palette.map(p => (
              <button
                key={p.id}
                onClick={() => setGrad(p.id)}
                className={`rounded-full px-3 py-1 font-medium transition ${grad === p.id ? "bg-white/80 text-black" : "bg-white/10 text-white/60 hover:text-white"}`}
              >{p.id}</button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} />
          <span className="text-white/60">Grid</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={paused} onChange={e => setPaused(e.target.checked)} />
          <span className="text-white/60">Pause</span>
        </label>
        <button onClick={copySVG} className="rounded-md border border-white/20 bg-white/10 px-3 py-1 text-white/60 hover:text-white">Copy SVG</button>
      </div>
      <div ref={ref} className="relative aspect-square w-full max-w-xl select-none overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-black/40 to-black/10 p-4">
        {showGrid && (
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        )}
        <svg
          id="playground-svg"
          viewBox="0 0 300 300"
          className="h-full w-full"
          role="img"
          aria-label="Animated reactive blob"
        >
          <defs>
            <radialGradient id="glow" cx={focusX + "%"} cy={focusY + "%"} r="70%">
              <stop offset="0%" stopColor={g.from} stopOpacity={0.8} />
              <stop offset="60%" stopColor={g.to} stopOpacity={0.35} />
              <stop offset="100%" stopColor={g.to} stopOpacity={0} />
            </radialGradient>
            <linearGradient id="strokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={g.from} />
              <stop offset="100%" stopColor={g.to} />
            </linearGradient>
            <filter id="blur"><feGaussianBlur stdDeviation="12" /></filter>
          </defs>
          <rect x="0" y="0" width="300" height="300" fill="url(#glow)" />
          <path d={blobPath} fill="url(#glow)" filter="url(#blur)" />
          <path d={blobPath} fill="none" stroke="url(#strokeGrad)" strokeWidth={2} />
          <circle cx={(point.x * 300).toFixed(1)} cy={(point.y * 300).toFixed(1)} r={4} fill={g.from} stroke={g.to} strokeWidth={1} />
        </svg>
        <div className="pointer-events-none absolute bottom-2 right-3 rounded-md bg-black/50 px-2 py-1 text-[10px] font-mono text-white/60">
          {focusX}%, {focusY}%
        </div>
      </div>
      <div className="glass rounded-xl p-4 text-xs text-white/60 space-y-2">
        <p><span className="text-white/80 font-semibold">How it works:</span> The blob path is regenerated every frame using a sinusoidal wobble. Mouse position feeds a radial gradient focus and a marker circle. Gradients + filters remain lightweight (single blur filter) for performance.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Pointer tracking (normalized 0–1)</li>
          <li>Procedural path generation (no external libs)</li>
          <li>Radial + linear gradients layered for glow + stroke</li>
          <li>Optional grid overlay for spatial reference</li>
          <li>Copy SVG serializes the current DOM state</li>
        </ul>
      </div>
    </div>
  );
}

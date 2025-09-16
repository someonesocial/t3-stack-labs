"use client";
import { ProgressBar } from "./progress";

export function ClientProgress({ modules }: { modules: { id: string }[] }) {
  const raw = typeof window !== "undefined" ? window.localStorage.getItem("learn-modules") : null;
  let checked = 0;
  try {
    const arr = JSON.parse(raw ?? "[]") as string[];
    checked = modules.filter((m) => arr.includes(m.id)).length;
  } catch {
    // ignore
  }
  const pct = Math.round((checked / modules.length) * 100);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-white/70">Overall progress</p>
        <p className="text-xs text-white/50">{checked}/{modules.length} • {pct}%</p>
      </div>
      <ProgressBar value={pct} />
    </div>
  );
}

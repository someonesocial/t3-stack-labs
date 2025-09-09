"use client";
import { useState } from "react";
import { useLocalStorage } from "../labs/use-local-storage";

interface ModuleItem {
  id: string;
  label: string;
  goal: string;
}
interface Props { modules: ModuleItem[] }

export default function ModuleChecklist({ modules }: Props) {
  const [done, setDone] = useLocalStorage<string[]>("learn-modules", []);
  const [open, setOpen] = useState<string | null>(null);

  function toggle(id: string) {
    setDone(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  const progress = Math.round((done.length / modules.length) * 100);

  return (
    <section className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white/90">Module Checklist</h2>
          <p className="text-xs text-white/50">{progress}% complete</p>
        </div>
        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <ul className="space-y-2">
          {modules.map(m => {
            const checked = done.includes(m.id);
            const expanded = open === m.id;
            return (
              <li key={m.id} className="rounded-lg border border-white/10 bg-white/5">
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    onClick={() => toggle(m.id)}
                    aria-pressed={checked}
                    className={`flex h-5 w-5 items-center justify-center rounded-md border text-[11px] font-bold transition ${checked ? "border-emerald-400 bg-emerald-500/80 text-white" : "border-white/30 text-white/40"}`}
                  >
                    {checked ? "✓" : ""}
                  </button>
                  <button
                    onClick={() => setOpen(expanded ? null : m.id)}
                    className="flex-1 text-left text-sm font-medium text-white/80 hover:text-white"
                  >
                    {m.label}
                  </button>
                  <button
                    onClick={() => setOpen(expanded ? null : m.id)}
                    className="text-xs text-white/40 hover:text-white"
                    aria-label="Toggle details"
                  >
                    {expanded ? "−" : "+"}
                  </button>
                </div>
                {expanded && (
                  <div className="border-t border-white/10 px-4 py-4 text-xs text-white/60 space-y-3">
                    <p><span className="font-semibold text-white/70">Goal:</span> {m.goal}</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Create a branch for this module.</li>
                      <li>Implement the feature (commit in small steps).</li>
                      <li>Add a short summary in README.</li>
                    </ul>
                    <p className="text-[10px] text-white/40">Tip: Keep changes atomic—helps you reason and revert.</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

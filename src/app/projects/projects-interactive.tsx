"use client";
import { useMemo, useState } from "react";

interface ProjectMeta { title: string; summary: string; tech: string[]; status: string }
interface Props { initial: ProjectMeta[] }

const statusFilters = ["All", "In Progress", "Prototype"]; // extend easily

export default function ProjectsInteractive({ initial }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [tech, setTech] = useState<string | null>(null);

  const allTech = useMemo(
    () => Array.from(new Set(initial.flatMap(p => p.tech))).sort(),
    [initial],
  );

  const filtered = initial.filter(p => {
    if (status !== "All" && p.status !== status) return false;
    if (tech && !p.tech.includes(tech)) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tech.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-20 space-y-10">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
        <p className="text-sm text-white/60">Filter & explore selected work and experiments.</p>
      </header>
      <div className="glass rounded-2xl p-5 grid gap-4 md:grid-cols-3">
        <div className="space-y-2 md:col-span-1">
          <label className="text-[11px] uppercase tracking-wide text-white/40">Search</label>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search titles, tech..."
            className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
        <div className="space-y-2 md:col-span-1">
          <label className="text-[11px] uppercase tracking-wide text-white/40">Status</label>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  status === s ? "bg-fuchsia-500/70 text-white" : "bg-white/10 text-white/60 hover:text-white"
                }`}
              >{s}</button>
            ))}
          </div>
        </div>
        <div className="space-y-2 md:col-span-1">
          <label className="text-[11px] uppercase tracking-wide text-white/40">Tech</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTech(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                tech === null ? "bg-cyan-500/70 text-white" : "bg-white/10 text-white/60 hover:text-white"
              }`}
            >All</button>
            {allTech.map(t => (
              <button
                key={t}
                onClick={() => setTech(t === tech ? null : t)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  tech === t ? "bg-cyan-500/70 text-white" : "bg-white/10 text-white/60 hover:text-white"
                }`}
              >{t}</button>
            ))}
          </div>
        </div>
        <div className="md:col-span-3 flex items-center justify-between text-[11px] text-white/40 pt-2">
          <p>{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>
          {(query || status !== "All" || tech) && (
            <button
              onClick={() => { setQuery(""); setStatus("All"); setTech(null); }}
              className="text-white/50 underline-offset-2 hover:text-white hover:underline"
            >Reset</button>
          )}
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {filtered.map(p => (
          <article key={p.title} className="glass rounded-2xl p-6 flex flex-col">
            <header className="mb-3 space-y-1">
              <h2 className="text-xl font-semibold text-white/90">{p.title}</h2>
              <p className="text-xs uppercase tracking-wide text-white/40">{p.status}</p>
            </header>
            <p className="mb-4 text-sm text-white/70 leading-relaxed">{p.summary}</p>
            <ul className="mt-auto flex flex-wrap gap-2 text-[11px] font-medium text-white/60">
              {p.tech.map(t => (
                <li key={t} className="rounded-full border border-white/15 px-2 py-1">{t}</li>
              ))}
            </ul>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-white/20 p-10 text-center text-sm text-white/50">
            No projects match your filters yet.
          </div>
        )}
      </div>
    </main>
  );
}

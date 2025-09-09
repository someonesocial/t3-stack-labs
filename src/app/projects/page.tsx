export const metadata = { title: "Projects — Your Name" };

interface ProjectMeta {
  title: string;
  summary: string;
  tech: string[];
  status: string;
}

const projects: ProjectMeta[] = [
  {
    title: "Interactive Learning Labs",
    summary: "Suite of small, focused modules showcasing full-stack patterns (optimistic mutations, streaming RSC, batching).",
    tech: ["Next.js", "tRPC", "Tailwind", "React Query"],
    status: "In Progress",
  },
  {
    title: "Design Token Pipeline",
    summary: "Experimental build step generating type-safe design tokens consumed by both CSS and TypeScript.",
    tech: ["TypeScript", "AST", "Tailwind"],
    status: "Prototype",
  },
];

export default function ProjectsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="mb-10 text-4xl font-bold tracking-tight">Projects</h1>
      <div className="grid gap-8 md:grid-cols-2">
        {projects.map((p) => (
          <article key={p.title} className="glass rounded-2xl p-6 flex flex-col">
            <header className="mb-3 space-y-1">
              <h2 className="text-xl font-semibold text-white/90">{p.title}</h2>
              <p className="text-xs uppercase tracking-wide text-white/40">{p.status}</p>
            </header>
            <p className="mb-4 text-sm text-white/70 leading-relaxed">{p.summary}</p>
            <ul className="mt-auto flex flex-wrap gap-2 text-[11px] font-medium text-white/60">
              {p.tech.map((t) => (
                <li key={t} className="rounded-full border border-white/15 px-2 py-1">{t}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </main>
  );
}

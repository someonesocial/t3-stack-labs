export const metadata = { title: "About — Paul Klemm" };

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">About Me</h1>
        <p className="text-white/70 leading-relaxed text-balance">
          I&apos;m a web engineer focused on building resilient, accessible, and performant experiences.
          This site is both a portfolio and a living sandbox—each section demonstrates patterns in the
          modern TypeScript full‑stack ecosystem. Rather than static case studies, I expose
          real interactive examples you can inspect and learn from.
        </p>
      </section>
      <section className="grid gap-6 sm:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/60">Focus Areas</h2>
          <ul className="space-y-1 text-sm text-white/70">
            <li>Type‑safe APIs (tRPC · Zod)</li>
            <li>Design Systems & Theming</li>
            <li>Performance & DX Tooling</li>
            <li>Interaction Design & Motion</li>
          </ul>
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/60">Tech Comfort</h2>
          <ul className="space-y-1 text-sm text-white/70">
            <li>TypeScript · React 19 · Next.js 15</li>
            <li>Prisma · Planetscale / SQLite</li>
            <li>Edge + Node runtimes</li>
            <li>CSS Architecture · Tailwind</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

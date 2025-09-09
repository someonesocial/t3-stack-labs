import React from "react";
import { GlassCard } from "./glass-card";

export function Hero() {
  return (
    <section className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 pt-24 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,hsl(280,90%,40%,0.35),transparent_70%)] blur-3xl" />
      </div>
      <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.15em] text-white/60 backdrop-blur">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />Dual Student • Online Media @ Hansgrohe
      </p>
      <h1 className="max-w-4xl bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-5xl font-extrabold leading-tight text-transparent sm:text-6xl md:text-7xl">
        Pixels, Pipes & Production Water Pressure.
      </h1>
      <p className="max-w-2xl text-balance text-lg text-white/60 md:text-xl">
        Hi, I&apos;m a dual online media student turning coffee into accessible, animated web things. This site is my laboratory: motion experiments, SVG wizardry, type‑safe APIs, and a few jokes to keep the build pipeline hydrated.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <a
          href="/projects"
          className="glass glass-hover group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white"
        >
          View Projects
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>
        <a
          href="/labs"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/70 hover:text-white"
        >
          Interactive Labs
        </a>
      </div>
      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 pt-12 md:grid-cols-3">
        <GlassCard title="Hands‑On" subtitle="Real practice" className="h-full">
          <p>Everything here I built from scratch: UI primitives, interactive SVG, optimistic data flows, and progressive enhancements.</p>
        </GlassCard>
        <GlassCard title="Tech I Use" subtitle="Daily stack" className="h-full">
          <p>TypeScript, React 19, Next.js 15, Tailwind, tRPC, a sprinkle of CSS art, and a lot of design tokens.</p>
        </GlassCard>
        <GlassCard title="Philosophy" subtitle="Human first" className="h-full">
          <p>Delight + clarity. Ship experimental ideas, then refine until even linters crack a smile.</p>
        </GlassCard>
      </div>
    </section>
  );
}

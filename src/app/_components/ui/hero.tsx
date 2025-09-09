import React from "react";
import { GlassCard } from "./glass-card";

export function Hero() {
  return (
    <section className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 pt-24 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,hsl(280,90%,40%,0.35),transparent_70%)] blur-3xl" />
      </div>
      <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.15em] text-white/60 backdrop-blur">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />Experimental Playground
      </p>
      <h1 className="max-w-4xl bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-5xl font-extrabold leading-tight text-transparent sm:text-6xl md:text-7xl">
        Build. Learn. Ship. Repeat.
      </h1>
      <p className="max-w-2xl text-balance text-lg text-white/60 md:text-xl">
        A living showcase of the modern T3 stack: tRPC, React Server & Client Components, Zod, Tailwind, and performance-focused patterns.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <a
          href="/learn"
          className="glass glass-hover group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white"
        >
          Start Learning
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>
        <a
          href="https://create.t3.gg"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/70 hover:text-white"
        >
          Docs
        </a>
      </div>
      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 pt-12 md:grid-cols-3">
        <GlassCard
          title="Typed Endpoints"
          subtitle="tRPC + Zod"
          className="h-full"
        >
          <p>
            Enjoy full-stack type-safety. Define once, infer everywhere. Catch regressions before they ship.
          </p>
        </GlassCard>
        <GlassCard title="Server + Client" subtitle="RSC aware" className="h-full">
          <p>
            Combine streaming server components with interactive client islands. Optimize data waterfalls.
          </p>
        </GlassCard>
        <GlassCard title="Performance" subtitle="React Query" className="h-full">
          <p>
            Automatic caching & smart invalidation. Batching + serialization for minimal payloads.
          </p>
        </GlassCard>
      </div>
    </section>
  );
}

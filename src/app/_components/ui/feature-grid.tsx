import React from "react";
import { GlassCard } from "./glass-card";

const features = [
  {
    title: "Superjson",
    desc: "Rich data types (Dates, Maps) across network boundaries without manual transforms.",
  },
  {
    title: "Optimistic UX",
    desc: "Build snappy interfaces by updating UI before round trip returns.",
  },
  {
    title: "Validation",
    desc: "Zod-powered schemas ensure only valid data enters your system.",
  },
  {
    title: "Hydration",
    desc: "RSC hydration helpers keep initial loads fast and interactive.",
  },
  {
    title: "Batching",
    desc: "Multiple tRPC calls merge into a single HTTP request reducing overhead.",
  },
  {
    title: "Refactoring Safety",
    desc: "Rename a field in one place; instantly reflected across client calls.",
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-10 flex items-end justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Why this stack?
        </h2>
        <a
          href="/learn"
          className="text-sm font-medium text-white/60 underline-offset-4 hover:text-white hover:underline"
        >
          Dive deeper
        </a>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <GlassCard key={f.title} title={f.title} className="h-full" subtitle="">
            <p>{f.desc}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

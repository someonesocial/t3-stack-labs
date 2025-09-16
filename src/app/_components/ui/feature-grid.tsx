import React from "react";
import { GlassCard } from "./glass-card";

const features = [
    {
      title: "Interface Whisperer",
      description: "Crafting calm, breathable UIs with motion that enhances—not distracts.",
      icon: "🌀",
    },
    {
      title: "Type Safety Gremlin",
      description: "If it compiles, it probably works. If it doesn’t, I make the compiler cry first.",
      icon: "🧩",
    },
    {
      title: "Latency Illusionist",
      description: "Optimistic updates + subtle skeletons = users forget the network exists.",
      icon: "🎩",
    },
    {
      title: "SVG Tinkerer",
      description: "Procedural blobs, gradients, and accessible vector experiments.",
      icon: "🖊️",
    },
    {
      title: "Design Dev Bridge",
      description: "Token-driven theming & glass layers that stay consistent under change.",
      icon: "🌉",
    },
    {
      title: "Continuous Learning",
      description: "Dual student mindset: iterate, document, reflect, ship again.",
      icon: "📚",
    },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-10 flex items-end justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          What I focused on in this project
        </h2>
        <a
          href="/projects"
          className="text-sm font-medium text-white/60 underline-offset-4 hover:text-white hover:underline"
        >
          See projects
        </a>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <GlassCard
            key={f.title}
            title={f.title}
            className="h-full"
            subtitle={f.icon}
          >
            <p>{f.description}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

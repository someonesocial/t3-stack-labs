import { HydrateClient } from "~/trpc/server";
import Link from "next/link";

export const metadata = { title: "SVG Playground" };

import { SvgPlayground } from "./";

export default function SvgPage() {
  return (
    <HydrateClient>
      <main className="mx-auto max-w-6xl px-6 py-20 space-y-12">
        <header className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-4xl font-bold tracking-tight">SVG / Motion Playground</h1>
            <Link href="/" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/20">← Back to home</Link>
          </div>
          <p className="text-white/60 text-sm md:text-base max-w-prose">
            Experiment with gradients, filters, path morphing, and pointer reactive effects. This demonstrates
            accessible, GPU-friendly vector techniques that integrate with the existing glass theme.
          </p>
        </header>
        <SvgPlayground />
      </main>
    </HydrateClient>
  );
}

import { LatestPost } from "~/app/_components/post";
import { api, HydrateClient } from "~/trpc/server";
import { Hero } from "./_components/ui/hero";
import { FeatureGrid } from "./_components/ui/feature-grid";
import { GlassCard } from "./_components/ui/glass-card";

export default async function Home() {
  const hello = await api.post.hello({ text: "Explorer" });
  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col">
        <Hero />
        <section className="mx-auto w-full max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-8 pb-24 pt-8 lg:grid-cols-3">
            <GlassCard
              title="Interaction Lab"
              subtitle="Optimistic demo"
              className="lg:col-span-2"
            >
              <p className="mb-4 text-white/70">
                A tiny post tool showing optimistic updates, validation, and
                type‑safe calls. It currently uses an in‑memory list (because
                not every prototype needs a database yet).
              </p>
              <LatestPost />
            </GlassCard>
            <GlassCard title="Server Hello" subtitle="Prefetched">
              <p className="text-white/70">
                Server rendered greeting: <br />
                <span className="font-mono text-white">{hello.greeting}</span>
              </p>
            </GlassCard>
          </div>
        </section>
        <FeatureGrid />
        <footer className="mx-auto w-full max-w-6xl px-6 pb-16 text-center text-xs text-white/40">
          Built as a personal learning lab – shipped piece by piece.
        </footer>
      </main>
    </HydrateClient>
  );
}

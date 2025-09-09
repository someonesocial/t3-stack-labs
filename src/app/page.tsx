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
              title="Live Data Sandbox"
              subtitle="tRPC + React Query"
              className="lg:col-span-2"
            >
              <p className="mb-4 text-white/70">
                Try creating posts below. This uses a mock in-memory store now
                (will migrate to a real DB in a later module). All procedures
                are fully typed end-to-end.
              </p>
              <LatestPost />
            </GlassCard>
            <GlassCard title="Hello" subtitle="Server Prefetch">
              <p className="text-white/70">
                Greeting fetched on the server: <br />
                <span className="font-mono text-white">{hello.greeting}</span>
              </p>
            </GlassCard>
          </div>
        </section>
        <FeatureGrid />
        <footer className="mx-auto w-full max-w-6xl px-6 pb-16 text-center text-xs text-white/40">
          Built as a learning playground – evolve it module by module.
        </footer>
      </main>
    </HydrateClient>
  );
}

import { api, HydrateClient } from "~/trpc/server";
import Link from "next/link";

export const metadata = {
  title: "Learn the Stack",
};

export default async function LearnPage() {
  // Prefetch list for hydration example
  void api.post.list.prefetch();
  const hello = await api.post.hello({ text: "Learner" });

  return (
    <HydrateClient>
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-16 text-white">
        <h1 className="text-4xl font-bold">Learning / Showcase</h1>
        <p className="text-lg text-white/80">{hello.greeting}! This section will grow as you explore concepts.</p>
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Planned Modules</h2>
          <ol className="list-decimal space-y-1 pl-5 text-white/80">
            <li>tRPC basics (queries & mutations)</li>
            <li>Data modeling & persistence (swap mock array with real DB)</li>
            <li>React Query caching & invalidation patterns</li>
            <li>Server vs Client Components with data</li>
            <li>Input validation with Zod</li>
            <li>Deployment considerations on constrained Windows server</li>
          </ol>
        </section>
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">Next Steps</h2>
          <p className="text-white/70">Open this file at <code>src/app/learn/page.tsx</code> and follow inline comments you will add as you progress.</p>
        </section>
        <Link href="/" className="text-sm text-white/60 underline hover:text-white">← Back to home</Link>
      </main>
    </HydrateClient>
  );
}

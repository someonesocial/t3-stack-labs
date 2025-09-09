import { api, HydrateClient } from "~/trpc/server";
import Link from "next/link";

export const metadata = { title: "Learn the Stack" };

import { ModuleChecklist } from "./";

const modules = [
  { id: "trpc", label: "tRPC basics (queries & mutations)", goal: "Define a query + mutation and use them in both RSC & client." },
  { id: "db", label: "Data modeling & persistence", goal: "Introduce Prisma + migrate from in-memory array." },
  { id: "cache", label: "React Query caching patterns", goal: "Show stale time + invalidate selectively." },
  { id: "rsc", label: "Server vs Client Components", goal: "Hybrid data fetch + streaming boundary." },
  { id: "validation", label: "Input validation with Zod", goal: "Form level + server enforcement." },
  { id: "deploy", label: "Windows server deployment", goal: "Minimal ops script + environment strategy." },
];

export default async function LearnPage() {
  void api.post.list.prefetch();
  const hello = await api.post.hello({ text: "Learner" });
  return (
    <HydrateClient>
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 py-16">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Learning / Showcase</h1>
          <p className="text-lg text-white/70">{hello.greeting}! Track progress as you build out each module.</p>
        </header>
        <ModuleChecklist modules={modules} />
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Next Steps</h2>
          <p className="text-white/70">Pick an unchecked module above and implement it. Each card expands with guidance.</p>
        </section>
        <Link href="/" className="text-sm text-white/60 underline hover:text-white">← Back to home</Link>
      </main>
    </HydrateClient>
  );
}

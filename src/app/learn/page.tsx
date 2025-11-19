import { api, HydrateClient } from "~/trpc/server";
import { BackButton } from "../_components/ui/back-button";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ModuleChecklist } from "./";
import { ProgressBar } from "./progress";

export const metadata = { title: "Learn the Stack" };

const modules = [
  {
    id: "orientation",
    label: "Orientation: the stack",
    description:
      "See the big picture first. Understand how React Server Components, tRPC, and the data layer connect through Next.js.",
    diagram: "stack" as const,
    rich: (
      <div className="space-y-3">
        <p>
          This app uses Next.js App Router with React Server Components (RSC) alongside Client Components. Data flows through a tRPC
          router exposed at <span className="font-mono">/api/trpc</span>, and responses are serialized with SuperJSON. The data layer is
          in-memory for demos, with Prisma planned for persistence.
        </p>
        <p>
          RSC lets you fetch data on the server and stream UI to the client, while Client Components handle interactivity like forms
          and buttons. tRPC provides end-to-end types, so input/output types are shared between server and client without manual DTOs.
        </p>
      </div>
    ),
  },
  {
    id: "flow",
    label: "From click to data",
    description:
      "Trace a user action through the stack. Follow a mutation from the UI, through tRPC with Zod validation, to the router and back into the cache.",
    diagram: "flow" as const,
    rich: (
      <div className="space-y-3">
        <p>
          A user action in a Client Component triggers a React Query mutation via <span className="font-mono">@trpc/react-query</span>.
          Input is validated with Zod on the server, the tRPC procedure runs, and on success the client invalidates or updates the cache
          so the UI is refreshed with the latest data.
        </p>
        <p>
          Errors propagate back as structured tRPC errors; the UI can display a friendly message or rollback any optimistic updates.
          This pattern keeps the UI responsive while ensuring consistency.
        </p>
      </div>
    ),
  },
  {
    id: "trpc",
    label: "First query and mutation",
    description:
      "Create a simple query and mutation in the tRPC router, then use them in both a Server Component and a Client Component with full type safety.",
    rich: (
      <div className="space-y-3">
        <p>
          Define procedures on the server like <span className="font-mono">post.list</span> (query) and <span className="font-mono">post.create</span>
          (mutation). The generated types flow into your client hooks, giving you autocompletion and compile-time checks when using
          <span className="font-mono">useSuspenseQuery</span> and <span className="font-mono">useMutation</span>.
        </p>
        <p>
          In Server Components, call server helpers directly or prefetch with tRPC before hydrating. In Client Components, use the
          React Query hooks to fetch and mutate; no manual REST client or schema duplication needed.
        </p>
      </div>
    ),
  },
  {
    id: "cache",
    label: "Cache strategy basics",
    description:
      "Adopt a sensible React Query strategy: define stale times, and invalidate specific queries after mutations for responsive updates.",
    rich: (
      <div className="space-y-3">
        <p>
          React Query balances freshness and performance. Use <span className="font-mono">staleTime</span> to avoid over-fetching and
          target invalidations to the keys affected by a mutation. This gives fast UIs without stale data lingering.
        </p>
        <p>
          For optimistic UX, update the cache immediately on mutation and rollback on error. For correctness-sensitive flows, prefer
          invalidation and refetch. Choose per use case.
        </p>
      </div>
    ),
  },
  {
    id: "validation",
    label: "Validate with Zod",
    description:
      "Share input schemas between client and server. Provide helpful error messages and ensure data contracts remain sound.",
    rich: (
      <div className="space-y-3">
        <p>
          Zod is a TypeScript-first schema and validation library. You define a schema once, and it both validates runtime inputs and
          infers static TypeScript types. This ensures your tRPC procedures receive well-formed data and your UI code remains type-safe.
        </p>
        <p className="text-white/80">How it works in this stack:</p>
        <ul className="list-disc pl-5">
          <li>
            In the router, each procedure has an <span className="font-mono">input(z.object(&#123; ... &#125;))</span>. Incoming data is
            validated at runtime; invalid input throws a structured error that tRPC serializes.
          </li>
          <li>
            On the client, calling the procedure uses the inferred type from the schema, so you get autocompletion and type errors if
            you pass the wrong shape.
          </li>
          <li>
            Handle validation errors in the UI by catching the tRPC error; surface a friendly message and highlight problematic fields.
          </li>
        </ul>
        <p>
          Practical tip: co-locate small schemas next to procedures, and extract shared primitives (like <span className="font-mono">postTitle</span>)
          to a common file when reused. Keep messages actionable (e.g., &quot;Title must be between 3 and 80 characters&quot;).
        </p>
      </div>
    ),
  },
  {
    id: "db",
    label: "Persist with Prisma",
    description:
      "Swap the in-memory demo for a database using Prisma. Model entities, run a migration, and update procedures to persist data.",
    rich: (
      <div className="space-y-3">
        <p>
          Prisma introduces a typed data layer. You define your schema, run migrations, and the generated client provides typed queries
          and mutations. Replace in-memory reads/writes with Prisma calls inside your tRPC procedures.
        </p>
        <p>
          Keep transaction boundaries in the server layer. Validate inputs with Zod before touching the database, and handle exceptions
          with clear user-facing messages.
        </p>
      </div>
    ),
  },
  {
    id: "deploy",
    label: "Prepare for deployment",
    description:
      "Think through environment variables, basic observability, and a simple Windows-friendly deployment approach.",
    rich: (
      <div className="space-y-3">
        <p>
          Before shipping, define your environment variables (with sane defaults), set up minimal logging/metrics, and script a repeatable
          deployment flow that works well on Windows. Consider health checks and a basic error boundary strategy.
        </p>
        <p>
          Keep secrets out of source control, and document the few commands needed to build and start the app. Aim for boring, reliable
          operations.
        </p>
      </div>
    ),
  },
];

export default async function LearnPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  void api.post.list.prefetch();
  const hello = await api.post.hello({ text: "Learner" });
  const cookieStore = await cookies();
  let done: string[] = [];
  try {
    const parsed: unknown = JSON.parse(cookieStore.get("learn-modules")?.value ?? "[]");
    if (Array.isArray(parsed) && parsed.every((x): x is string => typeof x === "string")) {
      done = parsed;
    }
  } catch {}
  const progress = Math.round(((done?.length ?? 0) / modules.length) * 100);
  const sp = (await searchParams) ?? {};
  const openId = typeof sp.step === "string" ? sp.step : null;
  async function resetProgress() {
    "use server";
    const c = await cookies();
    c.set("learn-modules", JSON.stringify([]), { path: "/", httpOnly: false, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
    revalidatePath("/learn");
  }
  return (
    <HydrateClient>
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-16">
        <header className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-4xl font-bold tracking-tight">Learning Journey</h1>
            <BackButton />
          </div>
          <p className="text-lg text-white/70">{hello.greeting}! Learn by moving step-by-step through the stack.</p>
          <div className="glass rounded-xl p-4">
            <div className="mb-1 flex items-center justify-between text-xs text-white/60">
              <span>Overall progress</span>
              <span>{done.length}/{modules.length} • {progress}%</span>
            </div>
            <ProgressBar value={progress} />
          </div>
          <div className="glass rounded-xl p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white/80">Table of contents</h2>
              <form action={resetProgress}>
                <button className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/70 hover:bg-white/20">Reset progress</button>
              </form>
            </div>
            <ol className="grid grid-cols-1 gap-2 text-sm text-white/70 md:grid-cols-2">
              {modules.map((m, i) => (
                <li key={m.id} className="flex items-center gap-2">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${done.includes(m.id) ? "bg-emerald-500/80 text-white" : "bg-white/10 text-white/70"}`}>{i + 1}</span>
                  <a href={`/learn?step=${m.id}`} className="hover:text-white">{m.label}</a>
                </li>
              ))}
            </ol>
          </div>
        </header>

        {/* Modules with inline visuals */}
        <section>
          <ModuleChecklist modules={modules} openId={openId} />
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">How to use this journey</h2>
          <p className="text-white/70">
            Explore each step in order, read the short explanation, and use the inline diagrams to build intuition. Mark a step when it
            feels clear and move on—progress is tracked for you.
          </p>
        </section>
        
      </main>
    </HydrateClient>
  );
}

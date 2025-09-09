"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { useLocalStorage } from "./use-local-storage";

interface Step {
  id: string;
  title: string;
  body: string;
}

const introSteps: Step[] = [
  {
    id: "query",
    title: "1. Run a typed query",
    body: "Below we call post.getLatest with full type safety. Try creating a post and watch the UI update.",
  },
  {
    id: "mutation",
    title: "2. Try an optimistic mutation",
    body: "Create posts quickly; the interface updates instantly before the server responds.",
  },
  {
    id: "validation",
    title: "3. Trigger validation",
    body: "Submit an empty title to see Zod-driven validation feedback.",
  },
];

const codeSamples: Record<string, string> = {
  query: `// server router
post: postRouter.getLatest()

// client
const [latest] = api.post.getLatest.useSuspenseQuery();`,
  mutation: `// mutation definition
create: publicProcedure
  .input(z.object({ name: z.string().min(1) }))
  .mutation(({ input }) => { /* create */ })

// client usage
const create = api.post.create.useMutation();
create.mutate({ name: "Hello" });`,
  validation: `// zod schema example
z.object({ name: z.string().min(1, 'Title required') })

// handling error
create.error?.data?.zodError`,
};

export function LabsInteractive() {
  const [active, setActive] = useLocalStorage("labs-active-step", "query");
  const [completed, setCompleted] = useLocalStorage<string[]>("labs-completed", []);
  const [simulateLatency, setSimulateLatency] = useLocalStorage("labs-latency", false);
  const [latest] = api.post.getLatest.useSuspenseQuery();
  const utils = api.useUtils();
  const create = api.post.create.useMutation({
    onMutate: async (vars) => {
      if (simulateLatency) await new Promise(r => setTimeout(r, 600));
      return vars;
    },
    onSuccess: async () => {
      await utils.post.invalidate();
    },
  });
  const [name, setName] = useState("");
  const maxChars = 40;
  const remaining = maxChars - name.length;

  useEffect(() => {
    if (!completed.includes(active)) {
      setCompleted([...completed, active]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const progressPct = Math.round((completed.length / introSteps.length) * 100);

  function copyCode(text: string) {
    void navigator.clipboard.writeText(text);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="mb-10 text-4xl font-bold tracking-tight">Labs</h1>
      <div className="grid gap-10 md:grid-cols-3">
        <aside className="space-y-4 md:col-span-1">
          <div className="space-y-2">
            {introSteps.map((s) => {
              const done = completed.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`group w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    active === s.id
                      ? "glass border-white/30 text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {done ? (
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/80 text-[10px] font-bold text-white">✓</span>
                    ) : (
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/30 text-[10px] text-white/40">{introSteps.indexOf(s)+1}</span>
                    )}
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="glass rounded-2xl p-4 space-y-3">
            <p className="text-xs uppercase tracking-wide text-white/40">Progress</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-right text-[10px] font-medium text-white/50">{progressPct}%</p>
            <label className="flex items-center gap-2 text-[11px] text-white/60">
              <input
                type="checkbox"
                checked={simulateLatency}
                onChange={(e) => setSimulateLatency(e.target.checked)}
                className="h-3 w-3 rounded border-white/30 bg-black/40"
              />
              Simulate latency
            </label>
          </div>
        </aside>
        <section className="md:col-span-2 space-y-6">
          {introSteps.map(
            (s) =>
              s.id === active && (
                <div key={s.id} className="space-y-6">
                  <div className="glass rounded-2xl p-6">
                    <h2 className="mb-2 text-xl font-semibold text-white/90">
                      {s.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-white/70">{s.body}</p>
                  </div>
                  <div className="glass rounded-2xl p-6 space-y-4">
                    <p className="text-xs uppercase tracking-wide text-white/40">
                      Live Playground
                    </p>
                    <p className="text-sm text-white/70">
                      Latest post: {latest ? latest.name : "— none —"}
                    </p>
                    <div className="relative">
                      <pre className="max-h-48 overflow-auto rounded-lg bg-black/40 p-3 text-[11px] leading-relaxed text-white/70">
{codeSamples[s.id]}
                      </pre>
                      <button
                        onClick={() => copyCode(codeSamples[s.id] ?? "")}
                        className="absolute right-2 top-2 rounded-md border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-medium text-white/60 hover:text-white"
                        aria-label="Copy code"
                      >Copy</button>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!name.trim()) return;
                        create.mutate({ name: name.trim() });
                        setName("");
                      }}
                      className="flex flex-col gap-2 sm:flex-row"
                    >
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Post title"
                        maxLength={maxChars}
                        className="flex-1 rounded-full bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30"
                      />
                      <button
                        type="submit"
                        disabled={create.isPending}
                        className="rounded-full bg-white/10 px-6 py-2 text-sm font-semibold tracking-wide transition hover:bg-white/20 disabled:opacity-40"
                      >
                        {create.isPending ? "Creating…" : "Create"}
                      </button>
                    </form>
                    <div className="flex items-center justify-between text-[10px] text-white/40">
                      <span>{remaining} chars left</span>
                      {create.isPending && <span className="animate-pulse text-white/60">Waiting for server…</span>}
                    </div>
                    {create.error && (
                      <p className="text-xs text-rose-300">
                        {create.error.data?.zodError?.fieldErrors?.name?.[0] ||
                          create.error.message}
                      </p>
                    )}
                  </div>
                </div>
              ),
          )}
        </section>
      </div>
    </main>
  );
}

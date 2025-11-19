"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "~/trpc/react";
import { useLocalStorage } from "./use-local-storage";
import { GlassCard } from "../_components/ui/glass-card";
import { BackButton } from "../_components/ui/back-button";

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// removed CopyButton to simplify the UI

export function LabsInteractive() {
  const utils = api.useUtils();
  const [mutationLatency, setMutationLatency] = useLocalStorage(
    "labs-mutation-latency",
    false,
  );

  // Seed controls
  const seed = api.post.seed.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
    },
  });
  const [seedCount, setSeedCount] = useState(5);

  // Latest
  const [latest] = api.post.getLatest.useSuspenseQuery();

  // Create
  const [name, setName] = useState("");
  const create = api.post.create.useMutation({
    onMutate: async (vars) => {
      if (mutationLatency) await new Promise((r) => setTimeout(r, 600));
      return vars;
    },
    onSuccess: async () => {
      await utils.post.invalidate();
    },
  });

  // List + delete
  const [posts] = api.post.list.useSuspenseQuery();
  const del = api.post.delete.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
    },
  });

  // Search
  const [q, setQ] = useState("");
  const dq = useDebouncedValue(q, 250);
  const search = api.post.search.useQuery({ q: dq }, { staleTime: 800 });

  // Infinite
  const infinite = api.post.listCursor.useInfiniteQuery(
    { limit: 5 },
    {
      getNextPageParam: (last) => last.nextCursor,
      staleTime: 1_000,
    },
  );
  const pages = useMemo(() => infinite.data?.pages ?? [], [infinite.data?.pages]);
  const infiniteItems = useMemo(() => pages.flatMap((p) => p.items), [pages]);

  // Optimistic like toggle
  const [failChance, setFailChance] = useState(0.3);
  const likeToggle = api.post.toggleLike.useMutation({
    onMutate: async ({ id }) => {
      // optimistic flip across caches that include posts
      await utils.post.list.cancel();
      await utils.post.search.cancel();
      await utils.post.listCursor.cancel();

      const prevList = utils.post.list.getData();
      const prevSearch = utils.post.search.getData({ q: dq });
      const prevCursor = utils.post.listCursor.getInfiniteData({ limit: 5 });

      utils.post.list.setData(undefined, (old) =>
        (old ?? []).map((p) => (p.id === id ? { ...p, liked: !p.liked } : p)),
      );
      if (prevSearch) {
        utils.post.search.setData({ q: dq }, (old) =>
          (old ?? []).map((p) => (p.id === id ? { ...p, liked: !p.liked } : p)),
        );
      }
      if (prevCursor) {
        utils.post.listCursor.setInfiniteData({ limit: 5 }, (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((pg) => ({
              ...pg,
              items: pg.items.map((p) => (p.id === id ? { ...p, liked: !p.liked } : p)),
            })),
          };
        });
      }

      return { prevList, prevSearch, prevCursor } as const;
    },
    onError: (_err, _vars, ctx) => {
      // rollback
      if (!ctx) return;
      utils.post.list.setData(undefined, ctx.prevList);
      if (ctx.prevSearch) utils.post.search.setData({ q: dq }, ctx.prevSearch);
      if (ctx.prevCursor)
        utils.post.listCursor.setInfiniteData({ limit: 5 }, ctx.prevCursor);
    },
    onSettled: async () => {
      await utils.post.invalidate();
    },
  });

  const maxChars = 40;
  const remaining = maxChars - name.length;

  // Support deep linking from Learn page: ?demo=latest|create|list|search|infinite|like
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const target = params.get("demo");
    if (!target) return;
    const el = document.getElementById(`labs-demo-${target}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("ring-2", "ring-cyan-400/60");
      const t = setTimeout(() => el.classList.remove("ring-2", "ring-cyan-400/60"), 1600);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <header className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex w-full items-center justify-between gap-3">
          <h1 className="text-4xl font-bold tracking-tight">Labs</h1>
          <BackButton />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <input
            type="number"
            min={1}
            max={20}
            value={seedCount}
            onChange={(e) => setSeedCount(Number(e.target.value))}
            className="w-20 rounded-md bg-white/10 px-2 py-1 text-white/80"
          />
          <button
            onClick={() => seed.mutate({ count: seedCount })}
            disabled={seed.isPending}
            className="rounded-full bg-white/10 px-4 py-2 font-semibold text-white/80 hover:bg-white/20 disabled:opacity-50"
          >
            {seed.isPending ? "Seeding…" : "Seed posts"}
          </button>
        </div>
      </header>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
  <GlassCard id="labs-demo-latest" title="Latest post" subtitle="Demonstrates a typed TRPC suspense query that retrieves the most recent post.">
          <p className="text-white/70">Latest: {latest ? latest.name : "— none —"}</p>
          <div className="mt-3">
            <pre className="max-h-40 overflow-auto rounded bg-black/40 p-3 text-[11px] text-white/70">{`const [latest] = api.post.getLatest.useSuspenseQuery();`}</pre>
          </div>
        </GlassCard>

  <GlassCard id="labs-demo-create" title="Create post" subtitle="Create a post via a TRPC mutation; optionally simulate network latency for UX testing.">
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
          <div className="mt-2 flex items-center justify-between text-[10px] text-white/40">
            <span>{remaining} chars left</span>
            {create.isPending && (
              <span className="animate-pulse text-white/60">Waiting for server…</span>
            )}
          </div>
          {create.error && (
            <p className="mt-2 text-xs text-rose-300">
              {create.error.data?.zodError?.fieldErrors?.name?.[0] ?? create.error.message}
            </p>
          )}
          <label className="mt-3 flex items-center gap-2 text-[11px] text-white/60">
            <input
              type="checkbox"
              checked={mutationLatency}
              onChange={(e) => setMutationLatency(e.target.checked)}
              className="h-3 w-3 rounded border-white/30 bg-black/40"
            />
            Simulate latency (this card only)
          </label>
          <div className="mt-3">
            <pre className="max-h-40 overflow-auto rounded bg-black/40 p-3 text-[11px] text-white/70">{`const create = api.post.create.useMutation({
  onMutate: async (vars) => {
    if (latency) await delay(600);
    return vars;
  },
  onSuccess: () => utils.post.invalidate(),
});`}</pre>
          </div>
        </GlassCard>

  <GlassCard id="labs-demo-list" title="List posts" subtitle="Fetch all posts and delete items; use cache invalidation to refetch.">
          <ul className="space-y-2">
            {posts.length === 0 && <li className="text-white/50 text-sm">No posts yet.</li>}
            {posts.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                <span className="text-white/80">#{p.id} — {p.name}</span>
                <div className="flex items-center gap-2">
                  <span className={"text-xs " + (p.liked ? "text-pink-300" : "text-white/40")}>{p.liked ? "♥" : "♡"}</span>
                  <button
                    type="button"
                    onClick={() => del.mutate({ id: p.id })}
                    className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/70 transition hover:bg-white/20"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-start">
            <button
              type="button"
              onClick={() => void utils.post.list.invalidate()}
              className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/80 transition hover:bg-white/20"
            >
              Refetch
            </button>
          </div>
        </GlassCard>

  <GlassCard id="labs-demo-search" title="Search posts" subtitle="Debounced client input paired with a TRPC query that filters posts by title.">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title…"
            className="w-full rounded-md bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30"
          />
          <div className="mt-3 min-h-[2.5rem] text-sm">
            {search.isLoading ? (
              <p className="text-white/50">Searching…</p>
            ) : (
              <ul className="space-y-1">
                {(search.data ?? []).map((p) => (
                  <li key={p.id} className="text-white/80">#{p.id} — {p.name}</li>
                ))}
                {search.data && search.data.length === 0 && (
                  <li className="text-white/50">No results.</li>
                )}
              </ul>
            )}
          </div>
          {/* copy button removed */}
        </GlassCard>

  <GlassCard id="labs-demo-infinite" title="Infinite posts" subtitle="Cursor-based pagination using useInfiniteQuery with a nextCursor from the API.">
          <ul className="space-y-2">
            {infiniteItems.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                <span className="text-white/80">#{p.id} — {p.name}</span>
                <span className={"text-xs " + (p.liked ? "text-pink-300" : "text-white/40")}>{p.liked ? "♥" : "♡"}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-start">
            <button
              type="button"
              onClick={() => void infinite.fetchNextPage()}
              disabled={!infinite.hasNextPage || infinite.isFetchingNextPage}
              className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/80 transition hover:bg-white/20 disabled:opacity-50"
            >
              {infinite.isFetchingNextPage ? "Loading…" : infinite.hasNextPage ? "Load more" : "No more"}
            </button>
          </div>
        </GlassCard>

  <GlassCard id="labs-demo-like" title="Optimistic like toggle" subtitle="Optimistic updates across multiple caches with rollback on server error; failure chance is adjustable.">
          <ul className="space-y-2">
            {posts.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                <span className="text-white/80">#{p.id} — {p.name}</span>
                <button
                  type="button"
                  onClick={() => likeToggle.mutate({ id: p.id, failChance })}
                  disabled={likeToggle.isPending}
                  className={"rounded-full px-3 py-1 text-[11px] font-semibold transition " + (p.liked ? "bg-pink-500/30 text-white hover:bg-pink-500/40" : "bg-white/10 text-white/70 hover:bg-white/20")}
                >
                  {p.liked ? "♥ Liked" : "♡ Like"}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-3">
            <label className="flex items-center gap-2 text-[11px] text-white/60">
              Failure chance
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={failChance}
                onChange={(e) => setFailChance(Number(e.target.value))}
                className="w-40"
              />
              <span className="tabular-nums text-white/70">{Math.round(failChance * 100)}%</span>
            </label>
          </div>
          {likeToggle.isError && (
            <p className="mt-2 text-xs text-rose-300">{likeToggle.error?.message ?? "Failed toggling like"}</p>
          )}
          {/* copy button removed */}
        </GlassCard>
      </div>
    </main>
  );
}

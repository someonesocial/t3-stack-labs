"use client";
import * as React from "react";
import { api } from "~/trpc/react";

export default function ChatClient() {
  const utils = api.useUtils();
  const [author, setAuthor] = React.useState("anonymous");
  const [input, setInput] = React.useState("");

  const {
    data,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.chat.list.useInfiniteQuery(
    { limit: 25 },
    {
      getNextPageParam: (last) => last.nextCursor,
      refetchInterval: 5000, // light polling for near-real-time
    },
  );

  const mutation = api.chat.send.useMutation({
    onMutate: async (vars) => {
      await utils.chat.list.cancel();
      const prev = utils.chat.list.getInfiniteData({ limit: 25 });
      utils.chat.list.setInfiniteData({ limit: 25 }, (old) => {
        const optimistic = {
          id: -Date.now(),
          content: vars.content,
          author: vars.author || "anonymous",
          createdAt: new Date(),
        };
        if (!old) {
          return {
            pages: [
              {
                items: [optimistic],
                nextCursor: undefined,
              },
            ],
            pageParams: [null],
          };
        }
        return {
          pages: old.pages.map((p, i) =>
            i === old.pages.length - 1
              ? { ...p, items: [...p.items, optimistic] }
              : p,
          ),
          pageParams: old.pageParams,
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.chat.list.setInfiniteData({ limit: 25 }, ctx.prev);
    },
    onSettled: () => {
      void utils.chat.list.invalidate();
    },
  });

  const messages =
    data?.pages.flatMap((p) => p.items).sort((a, b) => a.id - b.id) ?? [];

  function send() {
    if (!input.trim()) return;
    mutation.mutate({ content: input.trim(), author: author.trim() || "anonymous" });
    setInput("");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-4 backdrop-blur h-96 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {isPending && <div className="text-xs text-white/50">Loading…</div>}
          {messages.map((m) => (
            <div key={m.id} className="rounded bg-white/5 px-3 py-2 text-sm leading-snug">
              <div className="flex items-center gap-2">
                <span className="font-medium">{m.author}</span>
                <span className="text-[10px] text-white/40">
                  {new Date(m.createdAt).toLocaleTimeString()}
                </span>
                {m.id < 0 && <span className="text-[10px] text-yellow-400">sending…</span>}
              </div>
              <div className="whitespace-pre-wrap break-words">{m.content}</div>
            </div>
          ))}
        </div>
        {hasNextPage && (
          <button
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            className="mt-2 self-start text-[11px] text-blue-300 hover:underline disabled:opacity-50"
          >
            {isFetchingNextPage ? "Loading…" : "Load earlier messages"}
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Name"
          className="w-32 rounded border border-white/15 bg-white/5 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-white/40"
        />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Type a message"
          className="flex-1 rounded border border-white/15 bg-white/5 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-white/40"
        />
        <button
          onClick={send}
          disabled={mutation.isPending || !input.trim()}
          className="rounded bg-blue-500/80 px-4 py-1 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {mutation.isPending ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}

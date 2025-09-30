"use client";
import * as React from "react";
import { api } from "~/trpc/react";

export default function ChatClient() {
  const utils = api.useUtils();
  const [author, setAuthor] = React.useState("anonymous");
  const [input, setInput] = React.useState("");
  const [userAtBottom, setUserAtBottom] = React.useState(true);
  const [newMessageSinceScroll, setNewMessageSinceScroll] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);
  const MAX_LEN = 500;

  const { data, isPending, fetchNextPage, hasNextPage, isFetchingNextPage } = api.chat.list.useInfiniteQuery(
    { limit: 25 },
    {
      getNextPageParam: (last) => last.nextCursor,
      refetchInterval: 5000,
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
      requestAnimationFrame(() => {
        if (userAtBottom) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const messages = data?.pages.flatMap((p) => p.items) ?? [];

  function send() {
    if (!input.trim() || input.length > MAX_LEN) return;
    mutation.mutate({ content: input.trim(), author: author.trim() || "anonymous" });
    setInput("");
  }

  // Track scroll position
  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const handler = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
      setUserAtBottom(atBottom);
      if (atBottom) setNewMessageSinceScroll(false);
      // Upward infinite scroll trigger
      if (el.scrollTop < 80 && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage().then(() => {
          // Preserve relative scroll position after prepending older messages
          requestAnimationFrame(() => {
            if (!el) return;
            // Scroll offset compensation: keep user roughly where they were
            el.scrollTop = el.scrollTop + 200; // heuristic; alternative: measure height diff with snapshot
          });
        });
      }
    };
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Initial scroll to bottom after first data load
  React.useEffect(() => {
    if (!isPending && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  // Auto-scroll when new messages appear and user is at bottom; else show indicator.
  const lastMessageIdRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (messages.length === 0) return;
    const newest = messages[messages.length - 1];
    if (!newest) return;
    if (lastMessageIdRef.current !== null && newest.id !== lastMessageIdRef.current) {
      if (userAtBottom) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      } else {
        setNewMessageSinceScroll(true);
      }
    }
    lastMessageIdRef.current = newest.id;
  }, [messages, userAtBottom]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-4 backdrop-blur h-96 flex flex-col">
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto space-y-2 pr-1"
          aria-label="Chat messages"
          aria-live="off"
        >
          {isPending && (
            <div className="space-y-2 animate-pulse" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 rounded bg-white/5" />
              ))}
            </div>
          )}
          {!isPending && messages.length === 0 && (
            <div className="text-xs text-white/40">No messages yet. Be the first.</div>
          )}
          {messages.map((m) => {
            const optimistic = m.id < 0;
            return (
              <div
                key={m.id}
                className={`rounded px-3 py-2 text-sm leading-snug ring-1 ring-white/10 bg-white/5 backdrop-blur transition ${
                  optimistic ? "opacity-70 animate-pulse" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white/90">{m.author}</span>
                  <span className="text-[10px] text-white/40">
                    {new Date(m.createdAt).toLocaleTimeString("de-DE", { hour12: false })}
                  </span>
                  {optimistic && (
                    <span className="text-[10px] text-yellow-400">sending…</span>
                  )}
                </div>
                <div className="whitespace-pre-wrap break-words text-white/80">
                  {m.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        {hasNextPage && (
          <div className="mt-2 flex justify-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-medium text-white/70 hover:bg-white/20 disabled:opacity-50"
            >
              {isFetchingNextPage ? "Loading…" : "Load earlier messages"}
            </button>
          </div>
        )}
        {newMessageSinceScroll && !userAtBottom && (
          <button
            onClick={() => {
              bottomRef.current?.scrollIntoView({ behavior: "smooth" });
              setNewMessageSinceScroll(false);
            }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-blue-500/80 px-3 py-1 text-[11px] font-medium text-white shadow hover:bg-blue-500"
          >
            New messages ↓
          </button>
        )}
      </div>

      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        aria-label="Send a message"
      >
        <div className="flex gap-2">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Name"
            maxLength={40}
            className="w-32 rounded border border-white/15 bg-white/5 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-white/40"
          />
          <div className="relative flex-1">
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
              maxLength={MAX_LEN}
              aria-label="Message"
              aria-describedby="chat-char-counter"
              className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-sm pr-14 focus:outline-none focus:ring-1 focus:ring-white/40"
            />
            <span
              id="chat-char-counter"
              className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] tabular-nums ${
                input.length > MAX_LEN * 0.9 ? "text-red-400" : "text-white/40"
              }`}
            >
              {input.length}/{MAX_LEN}
            </span>
          </div>
          <button
            type="submit"
            disabled={mutation.isPending || !input.trim() || input.length > MAX_LEN}
            className="relative rounded bg-blue-500/80 px-5 py-2 text-sm font-medium text-white shadow hover:bg-blue-500 disabled:opacity-50"
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Sending…
              </span>
            ) : (
              "Send"
            )}
          </button>
        </div>
        {mutation.error && (
          <div className="flex items-center gap-3 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
            <span>Failed to send.</span>
            <button
              type="button"
              onClick={() => send()}
              className="rounded bg-red-500/30 px-2 py-0.5 text-[11px] font-medium hover:bg-red-500/40"
            >Retry</button>
          </div>
        )}
      </form>
      <div className="sr-only" aria-live="polite">
        {messages.length} messages loaded
      </div>
    </div>
  );
}

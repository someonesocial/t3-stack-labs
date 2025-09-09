"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function LatestPost() {
  const [latestPost] = api.post.getLatest.useSuspenseQuery();
  const utils = api.useUtils();
  const [name, setName] = useState("");
  const [optimisticName, setOptimisticName] = useState<string | null>(null);

  const trimmed = name.trim();
  const isInvalid = trimmed.length === 0;

  const createPost = api.post.create.useMutation({
    // Optimistic update pattern
    onMutate: async (input) => {
      setOptimisticName(input.name);
      // Cancel outgoing refetches so they don't overwrite our optimistic value
      await utils.post.getLatest.cancel();
      const prev = utils.post.getLatest.getData();
      // Optimistically set new latest
      utils.post.getLatest.setData(undefined, () => ({ id: Date.now(), name: input.name }));
      return { prev };
    },
    onError: (_err, _input, ctx) => {
      // Rollback
      if (ctx?.prev) utils.post.getLatest.setData(undefined, ctx.prev);
      setOptimisticName(null);
    },
    onSuccess: () => {
      setName("");
    },
    onSettled: async () => {
      setOptimisticName(null);
      await utils.post.invalidate();
    },
  });

  const activeLatest = optimisticName
    ? { name: optimisticName }
    : latestPost;

  const errorMessage =
    createPost.error?.data?.zodError?.fieldErrors?.name?.[0] ??
    createPost.error?.message;

  return (
    <div className="w-full max-w-md space-y-3">
      {activeLatest ? (
        <p className="truncate text-sm text-white/80">
          Your most recent post: <span className="font-medium text-white">{activeLatest.name}</span>
          {optimisticName && createPost.isPending && (
            <span className="ml-2 animate-pulse text-[10px] uppercase tracking-wider text-white/50">saving…</span>
          )}
        </p>
      ) : (
        <p className="text-sm text-white/60">You have no posts yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isInvalid || createPost.isPending) return;
          createPost.mutate({ name: trimmed });
        }}
        className="flex flex-col gap-2"
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-full bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-invalid={isInvalid || !!errorMessage}
            aria-describedby="post-title-error"
          />
        </div>
        <button
          type="submit"
            className="rounded-full bg-white/10 px-8 py-2 text-sm font-semibold transition enabled:hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={isInvalid || createPost.isPending}
        >
          {createPost.isPending ? "Submitting..." : "Create Post"}
        </button>
        <div id="post-title-error" className="min-h-[1rem]">
          {errorMessage && (
            <p className="text-xs text-rose-300" role="alert">
              {errorMessage}
            </p>
          )}
          {!errorMessage && isInvalid && name.length > 0 && (
            <p className="text-xs text-white/40">Title can’t be blank.</p>
          )}
        </div>
      </form>
    </div>
  );
}

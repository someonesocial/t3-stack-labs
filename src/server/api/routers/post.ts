import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Mocked DB
interface Post {
  id: number;
  name: string;
  liked?: boolean;
}
const posts: Post[] = [
  {
    id: 1,
    name: "Hello World",
    liked: false,
  },
];

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  /**
   * Return all posts (demo of simple query returning an array)
   */
  list: publicProcedure.query(() => {
    return posts;
  }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const post: Post = {
        id: posts.length + 1,
        name: input.name,
      };
      posts.push(post);
      return post;
    }),

  /**
   * Delete a post by id (simple in-memory demo)
   */
  delete: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const idx = posts.findIndex((p) => p.id === input.id);
      if (idx === -1) return null;
      const [deleted] = posts.splice(idx, 1);
      return deleted ?? null;
    }),

  getLatest: publicProcedure.query(() => {
    return posts.at(-1) ?? null;
  }),

  /**
   * Simple text search in name
   */
  search: publicProcedure
    .input(z.object({ q: z.string().trim().optional() }).optional())
    .query(({ input }) => {
      const q = input?.q?.toLowerCase() ?? "";
      if (!q) return posts;
      return posts.filter((p) => p.name.toLowerCase().includes(q));
    }),

  /**
   * Cursor pagination demo (by id ascending)
   */
  listCursor: publicProcedure
    .input(z.object({ cursor: z.number().int().optional(), limit: z.number().int().min(1).max(10).default(5) }).optional())
    .query(({ input }) => {
      const limit = input?.limit ?? 5;
      const cursor = input?.cursor ?? 0;
      // posts are kept in ascending id order as we only push and delete
      const startIdx = posts.findIndex((p) => p.id === cursor);
      const from = startIdx >= 0 ? startIdx + 1 : 0;
      const slice = posts.slice(from, from + limit);
      const nextCursor = slice.length === limit ? slice[slice.length - 1]?.id : undefined;
      return { items: slice, nextCursor };
    }),

  /**
   * Toggle like with simulated random failure (to demonstrate optimistic UI)
   */
  toggleLike: publicProcedure
    .input(z.object({ id: z.number().int().positive(), failChance: z.number().min(0).max(1).optional() }))
    .mutation(async ({ input }) => {
      // simulated failure (default 30%)
      const failChance = input.failChance ?? 0.3;
      if (Math.random() < failChance) {
        throw new Error("Random failure toggling like");
      }
      const p = posts.find((x) => x.id === input.id);
      if (!p) return null;
      p.liked = !p.liked;
      return p;
    }),

  /**
   * Update a post name (simple edit)
   */
  updateName: publicProcedure
    .input(z.object({ id: z.number().int().positive(), name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const p = posts.find((x) => x.id === input.id);
      if (!p) return null;
      p.name = input.name;
      return p;
    }),

  /**
   * Seed some demo posts
   */
  seed: publicProcedure
    .input(z.object({ count: z.number().int().min(1).max(20).default(5) }).optional())
    .mutation(async ({ input }) => {
      const count = input?.count ?? 5;
      const base = posts.length;
      for (let i = 1; i <= count; i++) {
        posts.push({ id: base + i, name: `Post ${base + i}`, liked: Math.random() < 0.3 });
      }
      return { added: count, total: posts.length };
    }),
});

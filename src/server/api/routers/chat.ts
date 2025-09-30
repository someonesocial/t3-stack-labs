import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const chatRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z
        .object({
          cursor: z.number().optional(), // id of last item (backwards pagination)
          limit: z.number().min(1).max(100).default(25),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 25;
      const cursor = input?.cursor;
      const messages = await prisma.message.findMany({
        take: limit + 1,
        where: cursor ? { id: { lt: cursor } } : undefined,
        orderBy: { id: "desc" },
      });

      let nextCursor: number | undefined = undefined;
      if (messages.length > limit) {
        const next = messages.pop();
        if (next) nextCursor = next.id;
      }

      return {
        items: messages.reverse(), // oldest first for UI
        nextCursor,
      };
    }),

  send: publicProcedure
    .input(
      z.object({
        content: z.string().trim().min(1).max(500),
        author: z.string().trim().min(1).max(40).default("anonymous"),
      }),
    )
    .mutation(async ({ input }) => {
      const msg = await prisma.message.create({
        data: {
          content: input.content,
          author: input.author || "anonymous",
        },
      });
      return msg;
    }),
});

export type ChatRouter = typeof chatRouter;

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const scoreRouter = createTRPCRouter({
  top: publicProcedure
    .input(
      z
        .object({ limit: z.number().min(1).max(50).default(10) })
        .optional(),
    )
    .query(async ({ input }) => {
      return prisma.score.findMany({
        take: input?.limit ?? 10,
        orderBy: { score: "desc" },
      });
    }),

  submit: publicProcedure
    .input(
      z.object({
        player: z.string().trim().min(1).max(40).default("anonymous"),
        score: z.number().int().min(0),
        lines: z.number().int().min(0),
        level: z.number().int().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const entry = await prisma.score.create({
        data: {
          player: input.player || "anonymous",
          score: input.score,
          lines: input.lines,
          level: input.level,
        },
      });
      await prisma.message.create({
        data: {
          content: `🏆 ${input.player} hat ${input.score.toLocaleString("de-DE")} Punkte erzielt! (Level ${input.level}, ${input.lines} Lines)`,
          author: "🎮 Tetris",
        },
      });
      return entry;
    }),
});

"use client";
import Tetris from "./tetris";
import Link from "next/link";
export default function GameClient() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-140px)] w-full max-w-6xl flex-col px-6 py-16">
      <div className="mb-10 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-4xl font-bold tracking-tight">Tetris Playground</h1>
          <Link href="/" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/20">← Back to home</Link>
        </div>
        <p className="max-w-2xl text-white/60 text-balance">
          A minimal, type-safe Tetris clone built for this portfolio. Keyboard or on‑screen controls. Shows game loop timing, piece bag randomization and soft drop.
        </p>
      </div>
      <Tetris />
    </main>
  );
}
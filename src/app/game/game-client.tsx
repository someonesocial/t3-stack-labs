"use client";
import Tetris from "./tetris";
export default function GameClient() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-140px)] w-full max-w-6xl flex-col px-6 py-16">
      <div className="mb-10 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl bg-gradient-to-br from-white via-white to-white/50 bg-clip-text text-transparent">Tetris Playground</h1>
        <p className="max-w-2xl text-white/60 text-balance">
          A minimal, type-safe Tetris clone built for this portfolio. Keyboard or on‑screen controls. Shows game loop timing, piece bag randomization and soft drop.
        </p>
      </div>
      <Tetris />
    </main>
  );
}
"use client";
import Tetris from "./tetris";
import Link from "next/link";
export default function GameClient() {
  return (
    <main className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden px-2 py-1 sm:px-6 sm:py-2" style={{ overscrollBehavior: "none", touchAction: "manipulation" }}>
      <div className="mb-1 flex items-center justify-between gap-3 sm:mb-2">
        <h1 className="text-lg font-bold tracking-tight sm:text-3xl">Tetris</h1>
        <Link href="/" className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/20 sm:px-4 sm:py-1.5 sm:text-sm">{"←"} Home</Link>
      </div>
      <div className="min-h-0 flex-1">
        <Tetris />
      </div>
    </main>
  );
}
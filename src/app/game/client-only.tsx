"use client";
import dynamic from "next/dynamic";

// Client-only dynamic import of the GameClient component
const GameClient = dynamic(() => import("./game-client"), { ssr: false });

export default function GameClientWrapper() {
  return <GameClient />;
}

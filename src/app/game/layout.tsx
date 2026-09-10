import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tetris Lab — Interactive Demo",
  description: "Glass-styled Tetris implementation as an interactive demo.",
};

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-0 overflow-hidden">{children}</div>;
}

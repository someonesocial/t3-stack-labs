import "~/styles/globals.css";

import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import Link from "next/link";
import { AnimatedBackground } from "./_components/ui/background";

export const metadata: Metadata = {
  title: "Paul Klemm — Web Engineer",
  description: "Portfolio & interactive labs exploring modern type‑safe full‑stack web engineering.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "Paul Klemm — Web Engineer",
    description: "Interactive portfolio & learning labs (tRPC · React · TypeScript · Tailwind)",
    url: "https://example.com",
    siteName: "Paul Klemm Portfolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Paul Klemm — Web Engineer",
    description: "Interactive portfolio & learning labs (tRPC · React · TypeScript · Tailwind)",
  },
};


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
  <html lang="en">
  <body className="min-h-screen font-sans text-white antialiased relative flex flex-col">
        <TRPCReactProvider>
      <AnimatedBackground />
          <header className="border-b border-white/10 bg-black/40 backdrop-blur">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 text-sm">
              <Link href="/" className="font-semibold tracking-wide">Paul Klemm</Link>
              <ul className="flex items-center gap-6">
                <li><a href="/about" className="text-white/70 hover:text-white">About</a></li>
                <li><a href="/projects" className="text-white/70 hover:text-white">Projects</a></li>
                <li><a href="/labs" className="text-white/70 hover:text-white">Labs</a></li>
                <li><a href="/learn" className="text-white/70 hover:text-white">Learn</a></li>
                <li><a href="/svg" className="text-white/70 hover:text-white">SVG</a></li>
                <li><a href="/game" className="text-white/70 hover:text-white">Game</a></li>
              </ul>
            </nav>
          </header>
          <div className="flex-1 w-full">{children}</div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}

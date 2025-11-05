"use client";
import Link from "next/link";

/**
 * BackButton – consistent minimal navigation control back to home.
 * Keeps styling centralized so future design tweaks require one edit.
 */
export function BackButton({ label = "← Back to home", className = "" }: { label?: string; className?: string }) {
  return (
    <Link
      href="/"
      className={`rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/20 ${className}`}
    >
      {label}
    </Link>
  );
}

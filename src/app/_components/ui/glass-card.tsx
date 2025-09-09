import React from "react"; // ensure JSX namespace
import type { ReactNode } from "react";
import { cn } from "../../_components/utils";

interface GlassCardProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  footer?: ReactNode;
  as?: React.ElementType;
}

export function GlassCard({
  title,
  subtitle,
  children,
  className,
  footer,
  as = "div",
}: GlassCardProps) {
  const Component = as ?? "div";
  return (
    <Component
      className={cn(
        "glass glass-hover relative flex flex-col overflow-hidden rounded-2xl p-6",
  "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_30%_20%,hsla(280,100%,60%,0.15),transparent_60%)]",
  className ?? "",
      )}
    >
  {(title ?? subtitle) && (
        <header className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold tracking-tight text-white/90">
              {title}
            </h3>
          )}
          {subtitle && <p className="text-sm text-white/50">{subtitle}</p>}
        </header>
      )}
      <div className="flex-1 text-sm text-white/80">{children}</div>
      {footer && <footer className="mt-4 text-xs text-white/50">{footer}</footer>}
    </Component>
  );
}

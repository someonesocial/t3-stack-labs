import React from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}
export function SectionHeader({ eyebrow, title, subtitle, align = "left", className }: SectionHeaderProps) {
  return (
    <div className={"space-y-2 " + className + (align === "center" ? " text-center mx-auto" : "") }>
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-fuchsia-300/70">{eyebrow}</p>
      )}
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
      {subtitle && (
        <p
          className={
            "max-w-prose text-sm text-white/60 md:text-base" +
            (align === "center" ? " mx-auto text-balance" : "")
          }
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

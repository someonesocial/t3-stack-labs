import { cn } from "../_components/utils";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-white/10", className)}>
      <div
        className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

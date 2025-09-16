import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { GlassCard } from "../_components/ui/glass-card";
import { FlowDiagramInline, StackDiagramInline } from "./diagrams";
import type { ReactNode } from "react";

export interface ModuleItem {
  id: string;
  label: string;
  description: string;
  diagram?: "stack" | "flow";
  rich?: ReactNode;
}

interface Props { modules: ModuleItem[]; openId?: string | null }

export default async function ModuleChecklist({ modules, openId }: Props) {
  const cookieStore = (await cookies()) as any;
  const raw = cookieStore.get("learn-modules")?.value ?? "[]";
  let done: string[] = [];
  try { done = JSON.parse(raw) as string[]; } catch {}

  const indexById = new Map(modules.map((m, i) => [m.id, i] as const));
  const open = openId && indexById.has(openId) ? openId : modules[0]?.id ?? null;
  const currentIndex = open ? indexById.get(open) ?? 0 : 0;
  const progress = Math.round(((done?.length ?? 0) / modules.length) * 100);

  async function toggleAction(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    const c = (await cookies()) as any;
    let arr: string[] = [];
    try { arr = JSON.parse(c.get("learn-modules")?.value ?? "[]"); } catch {}
    if (arr.includes(id)) arr = arr.filter((x) => x !== id); else arr.push(id);
    c.set("learn-modules", JSON.stringify(arr), { path: "/", httpOnly: false, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
    revalidatePath("/learn");
  }

  return (
    <section className="space-y-6">
      <GlassCard title="Step-by-step modules" subtitle="Work through each step, mark it done, and move on.">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs text-white/50">{progress}% complete</p>
          <div className="text-[11px] text-white/60">{done.length}/{modules.length} done</div>
        </div>
        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <ol className="space-y-2">
          {modules.map((m, i) => {
            const checked = done.includes(m.id);
            const expanded = open === m.id;
            return (
              <li key={m.id} className="rounded-lg border border-white/10 bg-white/5">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${checked ? "bg-emerald-500/80 text-white" : "bg-white/10 text-white/70"}`}>
                    {i + 1}
                  </div>
                  <a href={`/learn?step=${m.id}`} className="flex-1 text-left text-sm font-medium text-white/80 hover:text-white">
                    {m.label}
                  </a>
                  <form action={toggleAction} className="m-0">
                    <input type="hidden" name="id" value={m.id} />
                    <button
                      aria-pressed={checked}
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${checked ? "bg-emerald-500/30 text-emerald-200" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
                    >
                      {checked ? "Done" : "Mark done"}
                    </button>
                  </form>
                </div>
                {expanded && (
                  <div className="border-t border-white/10 px-4 py-4 text-sm text-white/70 space-y-4">
                    {m.rich ? (
                      <div className="space-y-3">{m.rich}</div>
                    ) : (
                      <p className="leading-relaxed">{m.description}</p>
                    )}
                    {m.diagram === "stack" ? (
                      <StackDiagramInline />
                    ) : m.diagram === "flow" ? (
                      <FlowDiagramInline />
                    ) : null}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </GlassCard>
    </section>
  );
}

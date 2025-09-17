import React from "react";
import { GlassCard } from "../_components/ui/glass-card";

export function StackDiagram() {
  return (
    <GlassCard title="Architecture overview" subtitle="How the pieces fit together in this app.">
      <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-black/40 to-black/10 p-4">
        <svg viewBox="0 0 960 420" className="h-full w-full" role="img" aria-label="Architecture diagram">
          <defs>
            <linearGradient id="gradA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.8" />
            </linearGradient>
            <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* Client side */}
          <rect x="40" y="40" width="280" height="150" rx="14" fill="#111827" stroke="url(#gradA)" strokeWidth="1.5" />
          <text x="54" y="70" className="fill-white" fontSize="14" fontWeight={700}>Browser</text>
          <text x="54" y="95" className="fill-white/70" fontSize="12">React (RSC + Client Components)</text>
          <g>
            <rect x="60" y="110" width="240" height="60" rx="10" fill="#1f2937" />
            <text x="74" y="135" className="fill-white" fontSize="12">@trpc/react-query</text>
            <text x="74" y="155" className="fill-white/60" fontSize="11">QueryClient, useQuery/useMutation</text>
          </g>

          {/* API Gateway */}
          <rect x="360" y="40" width="240" height="80" rx="12" fill="#111827" stroke="url(#gradA)" strokeWidth="1.5" />
          <text x="374" y="70" className="fill-white" fontSize="14" fontWeight={700}>Next.js API Route</text>
          <text x="374" y="95" className="fill-white/70" fontSize="12">/api/trpc (batch stream link)</text>

          {/* Server side */}
          <rect x="640" y="40" width="280" height="150" rx="14" fill="#111827" stroke="url(#gradA)" strokeWidth="1.5" />
          <text x="654" y="70" className="fill-white" fontSize="14" fontWeight={700}>tRPC Router</text>
          <text x="654" y="95" className="fill-white/70" fontSize="12">Procedures + SuperJSON</text>
          <g>
            <rect x="660" y="110" width="240" height="60" rx="10" fill="#1f2937" />
            <text x="674" y="135" className="fill-white" fontSize="12">Zod validation</text>
            <text x="674" y="155" className="fill-white/60" fontSize="11">input schemas, error shapes</text>
          </g>

          {/* Data */}
          <rect x="640" y="220" width="280" height="120" rx="14" fill="#111827" stroke="url(#gradA)" strokeWidth="1.5" />
          <text x="654" y="250" className="fill-white" fontSize="14" fontWeight={700}>Data layer</text>
          <text x="654" y="274" className="fill-white/70" fontSize="12">Prisma (planned) / in-memory (demo)</text>

          {/* Arrows */}
          <g stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
              </marker>
            </defs>
            <line x1="320" y1="115" x2="360" y2="80" />
            <line x1="600" y1="80" x2="640" y2="80" />
            <line x1="780" y1="190" x2="780" y2="220" />
            {/* back */}
            <line x1="640" y1="120" x2="600" y2="120" />
            <line x1="360" y1="120" x2="320" y2="155" />
          </g>
        </svg>
      </div>
    </GlassCard>
  );
}

export function StackDiagramInline() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-black/40 to-black/10 p-4">
      <svg viewBox="0 0 960 420" className="h-full w-full" role="img" aria-label="Architecture diagram (inline)">
        <defs>
          <linearGradient id="gradA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.8" />
          </linearGradient>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <rect x="40" y="40" width="280" height="150" rx="14" fill="#111827" stroke="url(#gradA)" strokeWidth="1.5" />
        <text x="54" y="70" className="fill-white" fontSize="14" fontWeight={700}>Browser</text>
        <text x="54" y="95" className="fill-white/70" fontSize="12">React (RSC + Client Components)</text>
        <g>
          <rect x="60" y="110" width="240" height="60" rx="10" fill="#1f2937" />
          <text x="74" y="135" className="fill-white" fontSize="12">@trpc/react-query</text>
          <text x="74" y="155" className="fill-white/60" fontSize="11">QueryClient, useQuery/useMutation</text>
        </g>
        <rect x="360" y="40" width="240" height="80" rx="12" fill="#111827" stroke="url(#gradA)" strokeWidth="1.5" />
        <text x="374" y="70" className="fill-white" fontSize="14" fontWeight={700}>Next.js API Route</text>
        <text x="374" y="95" className="fill-white/70" fontSize="12">/api/trpc (batch stream link)</text>
        <rect x="640" y="40" width="280" height="150" rx="14" fill="#111827" stroke="url(#gradA)" strokeWidth="1.5" />
        <text x="654" y="70" className="fill-white" fontSize="14" fontWeight={700}>tRPC Router</text>
        <text x="654" y="95" className="fill-white/70" fontSize="12">Procedures + SuperJSON</text>
        <g>
          <rect x="660" y="110" width="240" height="60" rx="10" fill="#1f2937" />
          <text x="674" y="135" className="fill-white" fontSize="12">Zod validation</text>
          <text x="674" y="155" className="fill-white/60" fontSize="11">input schemas, error shapes</text>
        </g>
        <rect x="640" y="220" width="280" height="120" rx="14" fill="#111827" stroke="url(#gradA)" strokeWidth="1.5" />
        <text x="654" y="250" className="fill-white" fontSize="14" fontWeight={700}>Data layer</text>
        <text x="654" y="274" className="fill-white/70" fontSize="12">Prisma (planned) / in-memory (demo)</text>
        <g stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
            </marker>
          </defs>
          <line x1="320" y1="115" x2="360" y2="80" />
          <line x1="600" y1="80" x2="640" y2="80" />
          <line x1="780" y1="190" x2="780" y2="220" />
          <line x1="640" y1="120" x2="600" y2="120" />
          <line x1="360" y1="120" x2="320" y2="155" />
        </g>
      </svg>
    </div>
  );
}

export function FlowDiagram() {
  return (
    <GlassCard title="Request ↔ Response flow" subtitle="From user action to cache update and re-render.">
      <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-black/40 to-black/10 p-4">
        <svg viewBox="0 0 960 280" className="h-full w-full" role="img" aria-label="Request/response flow diagram">
          <defs>
            <marker id="arrow2" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#93c5fd" />
            </marker>
          </defs>
          {[
            { x: 40, label: "UI Event", sub: "Button click" },
            { x: 200, label: "useMutation", sub: "@trpc/react-query" },
            { x: 380, label: "tRPC", sub: "/api/trpc" },
            { x: 540, label: "Zod", sub: "Input validation" },
            { x: 690, label: "Router", sub: "Procedure executes" },
            { x: 840, label: "Cache", sub: "Invalidate / update" },
          ].map((n, i) => (
            <g key={i}>
              <rect x={n.x} y={80} width={120} height={64} rx={10} fill="#111827" stroke="#1f2937" />
              <text x={n.x + 10} y={104} className="fill-white" fontSize="13" fontWeight={700}>{n.label}</text>
              <text x={n.x + 10} y={124} className="fill-white/70" fontSize="11">{n.sub}</text>
            </g>
          ))}
          {/* arrows */}
          <g stroke="#93c5fd" strokeWidth="1.5" markerEnd="url(#arrow2)">
            <line x1={160} y1={112} x2={200} y2={112} />
            <line x1={320} y1={112} x2={380} y2={112} />
            <line x1={500} y1={112} x2={540} y2={112} />
            <line x1={660} y1={112} x2={690} y2={112} />
            <line x1={810} y1={112} x2={840} y2={112} />
          </g>
          <text x="40" y="180" className="fill-white/60" fontSize="12">On success: invalidate queries → React Query refetches → UI updates.</text>
          <text x="40" y="200" className="fill-white/60" fontSize="12">On error: surface error to the user, rollback optimistic state if needed.</text>
        </svg>
      </div>
    </GlassCard>
  );
}

export function FlowDiagramInline() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-black/40 to-black/10 p-4">
      <svg viewBox="0 0 960 280" className="h-full w-full" role="img" aria-label="Request/response flow diagram (inline)">
        <defs>
          <marker id="arrow2" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#93c5fd" />
          </marker>
        </defs>
        {[
          { x: 40, label: "UI Event", sub: "Button click / form submit" },
          { x: 200, label: "useMutation", sub: "@trpc/react-query" },
          { x: 380, label: "tRPC", sub: "/api/trpc" },
          { x: 540, label: "Zod", sub: "Input validation" },
          { x: 690, label: "Router", sub: "Procedure executes" },
          { x: 840, label: "Cache", sub: "Invalidate / update" },
        ].map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={80} width={120} height={64} rx={10} fill="#111827" stroke="#1f2937" />
            <text x={n.x + 10} y={104} className="fill-white" fontSize="13" fontWeight={700}>{n.label}</text>
            <text x={n.x + 10} y={124} className="fill-white/70" fontSize="11">{n.sub}</text>
          </g>
        ))}
        <g stroke="#93c5fd" strokeWidth="1.5" markerEnd="url(#arrow2)">
          <line x1={160} y1={112} x2={200} y2={112} />
          <line x1={320} y1={112} x2={380} y2={112} />
          <line x1={500} y1={112} x2={540} y2={112} />
          <line x1={660} y1={112} x2={690} y2={112} />
          <line x1={810} y1={112} x2={840} y2={112} />
        </g>
        <text x="40" y="180" className="fill-white/60" fontSize="12">On success: invalidate queries → React Query refetches → UI updates.</text>
        <text x="40" y="200" className="fill-white/60" fontSize="12">On error: surface error to the user, rollback optimistic state if needed.</text>
      </svg>
    </div>
  );
}

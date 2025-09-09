export const metadata = { title: "Projects — Paul Klemm" };

interface ProjectMeta {
  title: string;
  summary: string;
  tech: string[];
  status: string;
}

const projects: ProjectMeta[] = [
  {
    title: "Interactive Learning Labs",
    summary: "Suite of small, focused modules showcasing full-stack patterns (optimistic mutations, streaming RSC, batching).",
    tech: ["Next.js", "tRPC", "Tailwind", "React Query"],
    status: "In Progress",
  },
  {
    title: "Design Token Pipeline",
    summary: "Experimental build step generating type-safe design tokens consumed by both CSS and TypeScript.",
    tech: ["TypeScript", "AST", "Tailwind"],
    status: "Prototype",
  },
];

import { ProjectsInteractive } from "./";

export default function ProjectsPage() {
  return <ProjectsInteractive initial={projects} />;
}

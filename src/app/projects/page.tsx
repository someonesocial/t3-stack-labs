export const metadata = { title: "Projects — Paul Klemm" };

interface ProjectMeta {
  title: string;
  summary: string;
  tech: string[];
  status: string;
  href?: string;
  external?: boolean;
}

const projects: ProjectMeta[] = [
  // Internal demos
  {
    title: "Tetris Playground",
    summary: "Glass-styled Tetris clone with requestAnimationFrame loop, 7-bag, ghost, soft/hard drop.",
    tech: ["React", "Next.js", "Tailwind"],
    status: "Playable",
    href: "/game",
  },
  {
    title: "Interactive Labs",
    summary: "Small modules showing optimistic mutations (tRPC + React Query) and data hydration.",
    tech: ["tRPC", "React Query", "Next.js"],
    status: "In Progress",
    href: "/labs",
  },
  {
    title: "SVG / Motion Playground",
    summary: "Gradients, filters, path morphing—accessible, GPU-friendly vector techniques.",
    tech: ["SVG", "CSS", "React"],
    status: "In Progress",
    href: "/svg",
  },
  {
    title: "Learn the Stack",
    summary: "Guided checklist for building tRPC + React Query patterns and RSC streaming.",
    tech: ["tRPC", "React Query", "RSC"],
    status: "Guide",
    href: "/learn",
  },
  {
    title: "Realtime Chat (DB)",
    summary: "SQLite/Prisma + tRPC infinite query with optimistic UI and polling.",
    tech: ["Prisma", "tRPC", "React Query"],
    status: "New",
    href: "/chat",
  },

  // External GitHub projects
  {
    title: "storeanumber",
    summary: "A simple fullstack website to store a number (university project).",
    tech: ["Fullstack", "PHP"],
    status: "Public",
    href: "https://github.com/someonesocial/storeanumber",
    external: true,
  },
  {
    title: "BIMtoTwin",
    summary: "Convert building information models (IFC) into a playable digital twin in Unreal Engine.",
    tech: ["IFC", "Unreal", "3D"],
    status: "Public",
    href: "https://github.com/someonesocial/BIMtoTwin",
    external: true,
  },
  {
    title: "PortfolioWebsite",
    summary: "Personal website with physics-based animations made from scratch in TypeScript.",
    tech: ["TypeScript", "Animations"],
    status: "Public",
    href: "https://github.com/someonesocial/PortfolioWebsite",
    external: true,
  },
  {
    title: "NFCcontactSharingPWA",
    summary: "Write contacts to NFC cards and scan them with any device (PWA).",
    tech: ["PWA", "NFC", "JavaScript"],
    status: "Public",
    href: "https://github.com/someonesocial/NFCcontactSharingPWA",
    external: true,
  },
];

import { ProjectsInteractive } from "./";

export default function ProjectsPage() {
  return <ProjectsInteractive initial={projects} />;
}

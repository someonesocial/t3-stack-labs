import { HydrateClient, api } from "~/trpc/server";
import { LabsInteractive } from "./";

export const metadata = { title: "Labs — Interactive Modules" };
export const dynamic = "force-dynamic";

export default async function LabsPage() {
  // Prefetch latest post for initial hydration (optional optimization)
  void api.post.getLatest.prefetch();
  return (
    <HydrateClient>
      <LabsInteractive />
    </HydrateClient>
  );
}

import ChatClient from "./chat-client";
import { Suspense } from "react";
import { BackButton } from "../_components/ui/back-button";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic"; // ensure fresh data per request

export default async function ChatPage() {
  const cookieStore = await cookies();
  const defaultAuthor = cookieStore.get("chat-author")?.value ?? "anonymous";
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
        <BackButton />
      </div>
      <p className="text-sm text-white/60 max-w-prose">
        A minimal database-backed chat built with the T3 stack (Next.js App Router, tRPC, Prisma, React Query). Messages are stored in the database and fetched with an infinite query plus optimistic updates.
      </p>
      <Suspense fallback={<div className="text-sm text-white/50">Loading…</div>}>
        <ChatClient defaultAuthor={defaultAuthor} />
      </Suspense>
    </main>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { BiliBiliSessionCard } from "../components/bilibili-session-card";
import { useBiliBiliSession } from "../hooks/use-bilibili-session";
import { m } from "../paraglide/messages.js";

export const Route = createFileRoute("/bilibili-session")({
  component: BiliBiliSessionPage,
});

function BiliBiliSessionPage() {
  const session = useBiliBiliSession();
  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {m.ui_bilibili_session()}
      </h1>
      <BiliBiliSessionCard session={session} />
    </div>
  );
}

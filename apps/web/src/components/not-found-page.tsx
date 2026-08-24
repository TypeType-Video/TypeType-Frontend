import { Link } from "@tanstack/react-router";
import { ArrowLeft, House } from "lucide-react";
import { m } from "../paraglide/messages.js";
import { useThemeStore } from "../stores/theme-store";

export function NotFoundPage() {
  const theme = useThemeStore((state) => state.theme);

  return (
    <section className="flex min-h-[calc(100svh-9rem)] flex-col items-center justify-center px-4 py-10 text-center">
      <img
        src={theme === "dark" ? "/not-found-dark.gif" : "/not-found.gif"}
        alt=""
        width={400}
        height={433}
        className="h-auto w-full max-w-[20rem]"
      />
      <div data-interface-copy className="mt-5 max-w-md">
        <h1 className="text-2xl font-bold text-fg">{m.not_found_title()}</h1>
        <p className="mt-2 text-sm leading-6 text-fg-muted">{m.not_found_description()}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border-strong bg-surface px-4 text-sm font-medium text-fg hover:bg-surface-strong"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {m.not_found_back()}
          </button>
          <Link
            to="/"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-fg px-4 text-sm font-medium text-app hover:bg-fg-strong"
          >
            <House className="size-4" aria-hidden="true" />
            {m.not_found_home()}
          </Link>
        </div>
      </div>
    </section>
  );
}

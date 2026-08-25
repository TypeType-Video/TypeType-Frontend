import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { FileDown, FileUp } from "lucide-react";
import { getPortabilityFormats } from "../lib/api-portability";
import { m } from "../paraglide/messages.js";
import { PortabilityExportPanel } from "./portability-export-panel";
import { PortabilityImportPanel } from "./portability-import-panel";

type PortabilityMode = "import" | "export";

export function DataPortabilityPage({ mode }: { mode: PortabilityMode }) {
  const formats = useQuery({
    queryKey: ["portability-formats"],
    queryFn: getPortabilityFormats,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 pt-5 [animation:page-fade-in_0.2s_ease-out] sm:pt-8">
      <header className="px-1">
        <h1 className="text-xl font-semibold text-fg sm:text-2xl">{m.data_portability_title()}</h1>
        <p className="mt-1 text-sm text-fg-muted">{m.data_portability_subtitle()}</p>
      </header>

      <div className="grid grid-cols-2 border border-border bg-surface p-1" role="tablist">
        <ModeLink active={mode === "import"} to="/import">
          <FileUp size={15} /> {m.data_portability_import()}
        </ModeLink>
        <ModeLink active={mode === "export"} to="/export">
          <FileDown size={15} /> {m.data_portability_export()}
        </ModeLink>
      </div>

      <main className="border-t border-border pt-5">
        {mode === "import" && formats.data && <PortabilityImportPanel formats={formats.data} />}
        {mode === "export" && formats.data && <PortabilityExportPanel formats={formats.data} />}
        {formats.isPending && (
          <p className="text-sm text-fg-muted">{m.data_portability_loading_formats()}</p>
        )}
        {formats.error && (
          <p role="alert" className="text-sm text-danger">
            {formats.error.message}
          </p>
        )}
      </main>
    </div>
  );
}

function ModeLink({
  active,
  to,
  children,
}: {
  active: boolean;
  to: "/import" | "/export";
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      role="tab"
      aria-selected={active}
      className={`inline-flex h-9 items-center justify-center gap-2 text-sm transition-colors ${active ? "bg-fg text-app" : "text-fg-muted hover:text-fg"}`}
    >
      {children}
    </Link>
  );
}

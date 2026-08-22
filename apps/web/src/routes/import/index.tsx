import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useState } from "react";
import { PortabilityExportPanel } from "../../components/portability-export-panel";
import { PortabilityImportPanel } from "../../components/portability-import-panel";
import { getPortabilityFormats } from "../../lib/api-portability";

function DataPortabilityPage() {
  const [mode, setMode] = useState<"import" | "export">("import");
  const formats = useQuery({
    queryKey: ["portability-formats"],
    queryFn: getPortabilityFormats,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 pt-5 [animation:page-fade-in_0.2s_ease-out] sm:pt-8">
      <header className="px-1">
        <h1 className="text-xl font-semibold text-fg sm:text-2xl">Data portability</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Move account data into TypeType or create a backup for another supported app.
        </p>
      </header>

      <div className="grid grid-cols-2 border border-border bg-surface p-1" role="tablist">
        <ModeButton active={mode === "import"} onClick={() => setMode("import")}>
          <ArrowDownToLine size={15} /> Import
        </ModeButton>
        <ModeButton active={mode === "export"} onClick={() => setMode("export")}>
          <ArrowUpFromLine size={15} /> Export
        </ModeButton>
      </div>

      <main className="border-t border-border pt-5">
        {mode === "import" && <PortabilityImportPanel />}
        {mode === "export" && formats.data && <PortabilityExportPanel formats={formats.data} />}
        {mode === "export" && formats.isPending && (
          <p className="text-sm text-fg-muted">Loading supported formats...</p>
        )}
        {mode === "export" && formats.error && (
          <p role="alert" className="text-sm text-danger">
            {formats.error.message}
          </p>
        )}
      </main>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center gap-2 text-sm transition-colors ${active ? "bg-fg text-app" : "text-fg-muted hover:text-fg"}`}
    >
      {children}
    </button>
  );
}

export const Route = createFileRoute("/import/")({ component: DataPortabilityPage });

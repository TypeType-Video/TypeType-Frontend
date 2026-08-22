import { FileAudio, FileVideo } from "lucide-react";

type Props = {
  active: boolean;
  onClick: () => void;
  label: string;
  mode: "video" | "audio";
};

export function DownloadModeButton({ active, onClick, label, mode }: Props) {
  const Icon = mode === "video" ? FileVideo : FileAudio;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
        active ? "bg-fg text-app" : "bg-surface-strong text-fg-muted hover:bg-surface-soft"
      }`}
    >
      <Icon size={14} aria-hidden="true" />
      {label}
    </button>
  );
}

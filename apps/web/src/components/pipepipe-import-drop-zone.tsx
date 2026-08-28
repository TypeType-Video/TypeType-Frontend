import type { RefObject } from "react";
import { m } from "../paraglide/messages.js";

type Props = {
  zoneTone: string;
  disabled: boolean;
  fileRef: RefObject<HTMLInputElement | null>;
  onOver: (v: boolean) => void;
  onFile: (file: File) => void;
};

export function PipePipeImportDropZone({ zoneTone, disabled, fileRef, onOver, onFile }: Props) {
  return (
    <label
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-12 text-center transition-colors ${zoneTone}`}
      onDragEnter={(e) => {
        e.preventDefault();
        if (!disabled) onOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) onOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        onOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onOver(false);
        if (disabled) return;
        const file = e.dataTransfer.files?.[0];
        if (file?.name.toLowerCase().endsWith(".zip")) onFile(file);
      }}
    >
      <span className="text-sm text-fg">{m.ui_drop_your_pipepipe_backup_zip_here()}</span>
      <span className="mt-1 text-xs text-fg-soft">{m.ui_or_click_to_select()}</span>
      <input
        ref={fileRef}
        type="file"
        accept=".zip,application/zip,application/x-zip-compressed"
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onFile(file);
        }}
      />
    </label>
  );
}

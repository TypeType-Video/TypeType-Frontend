import { ImageUp } from "lucide-react";
import { useRef } from "react";
import { useAvatar } from "../hooks/use-avatar";
import { m } from "../paraglide/messages.js";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

type Props = {
  onMessage: (message: string) => void;
};

export function CustomAvatarUpload({ onMessage }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { custom } = useAvatar();

  function upload(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_TYPES.has(file.type)) {
      onMessage(m.avatar_invalid_type());
      return;
    }
    if (file.size > MAX_BYTES) {
      onMessage(m.avatar_too_large());
      return;
    }
    custom.mutate(file, {
      onSuccess: () => onMessage(m.avatar_updated()),
      onError: () => onMessage(m.avatar_upload_failed()),
    });
  }

  return (
    <div className="flex flex-col items-start justify-between gap-3 border-b border-border py-5 sm:flex-row sm:items-center">
      <div>
        <p className="text-sm font-medium text-fg">{m.avatar_custom_title()}</p>
        <p className="mt-1 text-xs text-fg-soft">{m.avatar_custom_description()}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          upload(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={custom.isPending}
        onClick={() => inputRef.current?.click()}
        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-sm border border-border-strong px-3 text-xs text-fg transition-colors hover:border-fg-soft disabled:opacity-50 sm:w-auto"
      >
        <ImageUp className="h-4 w-4" />
        {m.avatar_upload()}
      </button>
    </div>
  );
}

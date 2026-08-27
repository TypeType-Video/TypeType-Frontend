import { LockKeyhole } from "lucide-react";
import { m } from "../paraglide/messages.js";

type Props = {
  compact?: boolean;
};

export function VideoMembershipBadge({ compact = false }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded bg-black/85 font-semibold text-white shadow-sm ${
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"
      }`}
    >
      <LockKeyhole aria-hidden="true" className={compact ? "size-3" : "size-3.5"} />
      {m.ui_members_only()}
    </span>
  );
}

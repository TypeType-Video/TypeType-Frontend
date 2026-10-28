import { Zap } from "lucide-react";
import { m } from "../paraglide/messages.js";
import type { ChannelVerification } from "../types/api";

const TONES: Record<ChannelVerification, string> = {
  personal: "text-[#f5a623]",
  organization: "text-[#2ea4e8]",
};

const LABELS: Record<ChannelVerification, () => string> = {
  personal: m.ui_verified_personal,
  organization: m.ui_verified_organization,
};

type Props = {
  verification: ChannelVerification;
  className?: string;
};

export function ChannelVerificationBadge({ verification, className = "h-4 w-4" }: Props) {
  const label = LABELS[verification]();
  return (
    <Zap
      className={`${className} shrink-0 fill-current ${TONES[verification]}`}
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
    </Zap>
  );
}

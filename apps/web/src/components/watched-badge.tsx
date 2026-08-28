import { m } from "../paraglide/messages.js";

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={m.ui_watched()}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function WatchedBadge() {
  return (
    <span
      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/80 text-white ring-1 ring-white/25 backdrop-blur"
      title={m.ui_watched()}
    >
      <CheckIcon />
    </span>
  );
}

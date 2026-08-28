import { m } from "../paraglide/messages.js";
export function ChevronLeft() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={m.ui_previous_month()}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function ChevronRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={m.ui_next_month()}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

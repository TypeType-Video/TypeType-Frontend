import { ChevronLeft, Menu } from "lucide-react";
import { m } from "../paraglide/messages.js";

type Props = {
  authPage: boolean;
  showBackButton: boolean;
  onBack: () => void;
  onToggleSidebar: () => void;
};

export function NavbarLeadingControl({ authPage, showBackButton, onBack, onToggleSidebar }: Props) {
  if (authPage) return null;

  if (showBackButton) {
    return (
      <button
        type="button"
        onClick={onBack}
        className="text-fg-muted hover:text-fg hover:bg-surface-strong transition-colors p-2 rounded-lg"
        aria-label={m.not_found_back()}
      >
        <ChevronLeft size={18} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggleSidebar}
      className="text-fg-muted hover:text-fg hover:bg-surface-strong transition-colors p-2 rounded-lg"
      aria-label={m.ui_toggle_sidebar()}
    >
      <Menu size={18} />
    </button>
  );
}

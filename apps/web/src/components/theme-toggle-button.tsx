import { Moon, Sun } from "lucide-react";
import { m } from "../paraglide/messages.js";
import { useThemeStore } from "../stores/theme-store";

type Props = {
  className?: string;
};

export function ThemeToggleButton({ className }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? m.ui_switch_to_light_mode() : m.ui_switch_to_dark_mode()}
      title={theme === "dark" ? m.ui_light_mode() : m.ui_dark_mode()}
      className={`relative inline-flex h-8 w-8 items-center justify-center rounded-sm border border-transparent text-fg transition-colors duration-200 hover:border-border hover:bg-surface ${className ?? ""}`}
    >
      <span className="relative block h-4 w-4">
        <Sun
          className={`absolute inset-0 h-4 w-4 transition-opacity duration-200 ${theme === "light" ? "opacity-100" : "opacity-0"}`}
        />
        <Moon
          className={`absolute inset-0 h-4 w-4 transition-opacity duration-200 ${theme === "dark" ? "opacity-100" : "opacity-0"}`}
        />
      </span>
    </button>
  );
}

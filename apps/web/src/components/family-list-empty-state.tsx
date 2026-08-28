import { Link } from "@tanstack/react-router";
import { useAuth } from "../hooks/use-auth";
import { m } from "../paraglide/messages.js";

type Props = {
  title?: string;
  description?: string;
  showSettingsAction?: boolean;
};

export function FamilyListEmptyState({
  title = m.ui_nothing_from_the_family_list_yet(),
  description = m.ui_add_trusted_channels_so_this_page_can_stay_focused_on_videos_you_pick(),
  showSettingsAction = true,
}: Props) {
  const { canGlobalBlock } = useAuth();
  const showAdminAction = showSettingsAction && canGlobalBlock;
  return (
    <section className="rounded-xl border border-border bg-surface/80 px-5 py-6 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-3">
        <span className="rounded-md border border-border bg-surface-soft px-3 py-1 text-[11px] font-medium text-fg-soft">
          {m.ui_family_list()}
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-fg">{title}</h2>
          <p className="text-xs leading-5 text-fg-soft">{description}</p>
        </div>
        {showAdminAction && (
          <Link
            to="/admin-console"
            search={{ section: "allow-list" }}
            className="mt-1 rounded-md bg-fg px-4 py-1.5 text-xs font-medium text-app transition-colors hover:bg-fg-strong"
          >
            {m.ui_open_allow_list()}
          </Link>
        )}
      </div>
    </section>
  );
}

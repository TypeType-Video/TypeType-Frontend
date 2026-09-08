import { useRouterState } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { siAppstore, siFdroid, siGoogleplay, siLemmy } from "simple-icons";
import { useInterfaceLocale } from "../hooks/use-interface-locale";
import {
  COMMUNITY_ANNOUNCEMENT_KEY,
  dismissCommunityAnnouncement,
  isCommunityAnnouncementDismissed,
  LEMMY_COMMUNITY_URL,
} from "../lib/community-announcement";
import { m } from "../paraglide/messages.js";
import { ServiceIcon } from "./service-icon";

const stores = [
  {
    icon: siGoogleplay,
    name: "Google Play",
    url: "https://play.google.com/store/apps/details?id=app.vger.voyager&pcampaignid=web_share",
  },
  { icon: siFdroid, name: "F-Droid", url: "https://f-droid.org/fr/packages/app.vger.voyager/" },
  {
    icon: siAppstore,
    name: "App Store",
    url: "https://apps.apple.com/us/app/voyager-for-lemmy/id6451429762",
  },
];

export function CommunityAnnouncement() {
  useInterfaceLocale();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [dismissed, setDismissed] = useState(isCommunityAnnouncementDismissed);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const visible = pathname === "/" && !dismissed;

  useEffect(() => {
    if (!visible) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previous;
    };
  }, [visible]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === COMMUNITY_ANNOUNCEMENT_KEY && event.newValue === "dismissed")
        setDismissed(true);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function dismiss() {
    dismissCommunityAnnouncement();
    setDismissed(true);
  }

  if (!visible) return null;
  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="community-announcement-title"
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-lg border border-border-strong bg-surface p-5 text-sm text-fg shadow-xl backdrop:bg-black/60 sm:p-6"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <img src="/logo.svg" alt="TypeType" className="h-8 w-8 shrink-0" />
          <h2 id="community-announcement-title" className="text-lg font-semibold">
            {m.community_lemmy_title()}
          </h2>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={m.admin_users_close()}
          title={m.admin_users_close()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded hover:bg-surface-strong"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="space-y-3 leading-relaxed text-fg-muted">
        <p>{m.community_lemmy_reason()}</p>
        <p>{m.community_lemmy_move()}</p>
        <p>{m.community_lemmy_support()}</p>
      </div>
      <a
        href={LEMMY_COMMUNITY_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-3 py-2 text-center font-semibold text-white hover:bg-accent-strong"
      >
        <ServiceIcon path={siLemmy.path} color="currentColor" label="Lemmy" />
        {m.community_lemmy_join()}
      </a>
      <section
        className="mt-5 border-t border-border pt-4"
        aria-label={m.community_lemmy_voyager()}
      >
        <p className="mb-3 text-sm font-medium">{m.community_lemmy_voyager()}</p>
        <div className="flex flex-wrap gap-2">
          {stores.map(({ icon, name, url }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border-strong px-3 py-2 hover:bg-surface-strong"
            >
              <ServiceIcon path={icon.path} color="currentColor" label={name} />
              {name}
            </a>
          ))}
        </div>
      </section>
    </dialog>,
    document.body,
  );
}

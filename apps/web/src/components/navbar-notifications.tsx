import { lazy, Suspense } from "react";

const NotificationsDropdown = lazy(() =>
  import("./notifications-dropdown").then((module) => ({
    default: module.NotificationsDropdown,
  })),
);

const PortabilityProgressHost = lazy(() =>
  import("./portability-progress-host").then((module) => ({
    default: module.PortabilityProgressHost,
  })),
);

const NotificationToastHost = lazy(() =>
  import("./notification-toast-host").then((module) => ({
    default: module.NotificationToastHost,
  })),
);

export function NavbarNotifications() {
  return (
    <>
      <Suspense fallback={null}>
        <NotificationsDropdown />
      </Suspense>
      <Suspense fallback={null}>
        <NotificationToastHost />
      </Suspense>
      <Suspense fallback={null}>
        <PortabilityProgressHost />
      </Suspense>
    </>
  );
}

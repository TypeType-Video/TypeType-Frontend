import { lazy, Suspense } from "react";

const NotificationsDropdown = lazy(() =>
  import("./notifications-dropdown").then((module) => ({
    default: module.NotificationsDropdown,
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
    </>
  );
}

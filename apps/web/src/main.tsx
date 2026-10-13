import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import "./index.css";
import { NotFoundPage } from "./components/not-found-page";
import { PageSpinner } from "./components/page-spinner";
import { InterfaceLocaleProvider } from "./hooks/use-interface-locale";
import { apiRetryDelay, shouldRetryApiError } from "./lib/api-retry";
import { installConsoleWarningFilter } from "./lib/console-warning-filter";
import { initializeDefaultLandingRedirect } from "./lib/default-landing";
import { initErrorCapture } from "./lib/error-capture";
import { clearProfileQueries, resetProfileQueries } from "./lib/profile-query-cache";
import { getLocale, getTextDirection } from "./paraglide/runtime.js";
import { routeTree } from "./routeTree.gen";
import { useAuthStore } from "./stores/auth-store";

installConsoleWarningFilter();
initErrorCapture();
document.documentElement.lang = getLocale();
document.documentElement.dir = getTextDirection();
initializeDefaultLandingRedirect(window.location.pathname);

const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFoundPage,
  defaultPendingComponent: PageSpinner,
  scrollRestoration: true,
});
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryApiError,
      retryDelay: apiRetryDelay,
    },
  },
});

useAuthStore.subscribe((session, previous) => {
  const previousProfileId = previous.me?.id;
  const nextProfileId = session.me?.id;
  if (previousProfileId && previousProfileId !== nextProfileId) {
    if (nextProfileId) {
      void resetProfileQueries(queryClient);
    } else {
      void clearProfileQueries(queryClient);
    }
  }
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <InterfaceLocaleProvider>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </InterfaceLocaleProvider>,
);

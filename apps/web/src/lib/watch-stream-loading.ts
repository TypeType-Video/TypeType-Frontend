import { detectProvider } from "./provider";

type BootstrapState = {
  isSuccess: boolean;
  isError: boolean;
};

export function shouldLoadFullWatchStream(
  sourceUrl: string,
  streamEnabled: boolean,
  bootstrap: BootstrapState,
): boolean {
  if (!streamEnabled) return false;
  if (detectProvider(sourceUrl) !== "youtube") return true;
  return bootstrap.isSuccess || bootstrap.isError;
}

import { useInterfaceLocale } from "./use-interface-locale";

export function useClientLocale() {
  return useInterfaceLocale().locale;
}

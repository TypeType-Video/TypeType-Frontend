import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getLocale,
  getTextDirection,
  type Locale,
  setLocale as setParaglideLocale,
} from "../paraglide/runtime.js";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function syncDocumentLocale(locale: Locale): void {
  document.documentElement.lang = locale;
  document.documentElement.dir = getTextDirection(locale);
}

export function InterfaceLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getLocale());
  const transitionTimerRef = useRef<number>(undefined);
  const setLocale = useCallback(async (next: Locale) => {
    if (next === getLocale()) return;
    await setParaglideLocale(next, { reload: false });
    syncDocumentLocale(next);
    setLocaleState(next);
    requestAnimationFrame(() => {
      const root = document.documentElement;
      root.classList.remove("interface-locale-enter");
      requestAnimationFrame(() => {
        root.classList.add("interface-locale-enter");
        window.clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = window.setTimeout(
          () => root.classList.remove("interface-locale-enter"),
          220,
        );
      });
    });
  }, []);
  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useInterfaceLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useInterfaceLocale must be used inside InterfaceLocaleProvider");
  return context;
}

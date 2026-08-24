import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
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
const EXIT_DURATION_MS = 90;
const ENTER_DURATION_MS = 150;

function syncDocumentLocale(locale: Locale): void {
  document.documentElement.lang = locale;
  document.documentElement.dir = getTextDirection(locale);
}

export function InterfaceLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getLocale());
  const transitionTimerRef = useRef<number>(undefined);
  const transitionIdRef = useRef(0);

  useEffect(
    () => () => {
      window.clearTimeout(transitionTimerRef.current);
      document.documentElement.classList.remove("interface-locale-exit", "interface-locale-enter");
    },
    [],
  );

  const setLocale = useCallback(async (next: Locale) => {
    if (next === getLocale()) return;
    const transitionId = ++transitionIdRef.current;
    const root = document.documentElement;
    root.classList.remove("interface-locale-enter");
    root.classList.add("interface-locale-exit");
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, EXIT_DURATION_MS);
    });
    if (transitionId !== transitionIdRef.current) return;
    await setParaglideLocale(next, { reload: false });
    syncDocumentLocale(next);
    flushSync(() => setLocaleState(next));
    root.classList.remove("interface-locale-exit");
    void root.offsetWidth;
    root.classList.add("interface-locale-enter");
    window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = window.setTimeout(() => {
      root.classList.remove("interface-locale-enter");
    }, ENTER_DURATION_MS);
  }, []);
  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useInterfaceLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useInterfaceLocale must be used inside InterfaceLocaleProvider");
  return context;
}

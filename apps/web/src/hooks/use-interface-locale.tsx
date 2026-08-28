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
  captureLocaleText,
  type LocaleTextAnimation,
  startLocaleDecryption,
} from "../lib/interface-locale-decryption";
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
const DECRYPTION_DURATION_MS = 800;

function syncDocumentLocale(locale: Locale): void {
  document.documentElement.lang = locale;
  document.documentElement.dir = getTextDirection(locale);
}

export function InterfaceLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getLocale());
  const transitionTimerRef = useRef<number>(undefined);
  const transitionIdRef = useRef(0);
  const textAnimationRef = useRef<LocaleTextAnimation | null>(null);

  useEffect(
    () => () => {
      window.clearTimeout(transitionTimerRef.current);
      textAnimationRef.current?.cancel();
    },
    [],
  );

  const setLocale = useCallback(async (next: Locale) => {
    if (next === getLocale()) return;
    const transitionId = ++transitionIdRef.current;
    textAnimationRef.current?.cancel();
    const previousText = captureLocaleText();
    await setParaglideLocale(next, { reload: false });
    if (transitionId !== transitionIdRef.current) return;
    syncDocumentLocale(next);
    flushSync(() => setLocaleState(next));
    textAnimationRef.current = startLocaleDecryption(previousText, DECRYPTION_DURATION_MS);
    window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = window.setTimeout(() => {
      textAnimationRef.current?.cancel();
      textAnimationRef.current = null;
    }, DECRYPTION_DURATION_MS);
  }, []);
  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useInterfaceLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useInterfaceLocale must be used inside InterfaceLocaleProvider");
  return context;
}

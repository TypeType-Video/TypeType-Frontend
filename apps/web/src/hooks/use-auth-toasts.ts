import { useEffect, useRef, useState } from "react";
import { m } from "../paraglide/messages.js";
import { useAuth } from "./use-auth";

export function useAuthToasts() {
  const [toast, setToast] = useState<string | null>(null);
  const { status } = useAuth();
  const previousStatus = useRef(status);

  useEffect(() => {
    if (previousStatus.current === status) return;
    const from = previousStatus.current;
    previousStatus.current = status;
    if (status === "authenticated" && from !== "loading") {
      setToast(m.login_signed_in());
      return;
    }
    if (status === "signed_out" && from !== "loading") {
      setToast(m.nav_signed_out());
    }
  }, [status]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(id);
  }, [toast]);

  return toast;
}

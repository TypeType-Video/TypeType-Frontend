import { useEffect, useRef, useState } from "react";
import { useSearchPanel } from "../hooks/use-search-panel";
import { SearchField } from "./search-field";
import { SearchPanel } from "./search-panel";

export function NavbarSearch() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  const state = useSearchPanel(close, open);
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (
        !state.confirmClearOpen &&
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      )
        setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !state.confirmClearOpen) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [state.confirmClearOpen]);
  return (
    <search className="mx-4 flex min-w-0 flex-1 justify-center">
      <div ref={rootRef} className="relative w-full min-w-0 max-w-2xl">
        <SearchField state={state} onFocus={() => setOpen(true)} />
        {open && (
          <div className="absolute left-1/2 top-full z-50 mt-2 max-h-[calc(100dvh-5rem)] w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 overflow-y-auto overscroll-contain">
            <SearchPanel state={state} onClose={close} />
          </div>
        )}
      </div>
    </search>
  );
}

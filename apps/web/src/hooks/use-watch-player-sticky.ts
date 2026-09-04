import { useEffect, useRef, useState } from "react";

const STICKY_HEADER_OFFSET = 56;

export function useWatchPlayerSticky(enabled: boolean) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!enabled || !sentinel || typeof IntersectionObserver === "undefined") {
      setCompact(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const passedHeader = entry.boundingClientRect.top <= STICKY_HEADER_OFFSET;
        setCompact(!entry.isIntersecting && passedHeader);
      },
      { rootMargin: `-${STICKY_HEADER_OFFSET}px 0px 0px 0px` },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled]);

  return { compact, sentinelRef };
}

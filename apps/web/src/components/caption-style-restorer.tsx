import { useEffect, useRef } from "react";
import {
  applyCaptionStyles,
  readCaptionStylesFromStorage,
  writeCaptionStylesToStorage,
} from "../lib/caption-styles";
import { useMediaPlayer, useMediaState } from "../lib/vidstack";
import type { CaptionStyles } from "../types/user";

type Props = {
  captionStyles: CaptionStyles;
  settingsReady: boolean;
  onChange: (styles: CaptionStyles) => void;
};

export function CaptionStyleRestorer({ captionStyles, settingsReady, onChange }: Props) {
  const player = useMediaPlayer();
  const canPlay = useMediaState("canPlay");
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const applyingRef = useRef(false);
  const restoredRef = useRef(false);
  const savedRef = useRef(JSON.stringify(captionStyles));
  savedRef.current = JSON.stringify(captionStyles);

  useEffect(() => {
    const el = player?.el;
    if (!el || !settingsReady || !canPlay || restoredRef.current) return;
    restoredRef.current = true;
    applyingRef.current = true;
    writeCaptionStylesToStorage(captionStyles);
    applyCaptionStyles(el, captionStyles);
    requestAnimationFrame(() => {
      applyingRef.current = false;
    });
  }, [player, settingsReady, canPlay, captionStyles]);

  useEffect(() => {
    const el = player?.el;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const observer = new MutationObserver(() => {
      if (applyingRef.current) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const styles = readCaptionStylesFromStorage();
        const serialized = JSON.stringify(styles);
        if (serialized === savedRef.current) return;
        savedRef.current = serialized;
        onChangeRef.current(styles);
      }, 600);
    });
    observer.observe(el, { attributes: true, attributeFilter: ["style"] });
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [player]);

  return null;
}

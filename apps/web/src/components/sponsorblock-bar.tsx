import { useEffect, useRef } from "react";
import { sponsorBlockBarPosition } from "../lib/sponsorblock-bar-layout";
import {
  getSponsorBlockCategoryColor,
  getSponsorBlockEndTime,
  getSponsorBlockStartTime,
} from "../lib/sponsorblock-settings";
import { useMediaState } from "../lib/vidstack";
import type { SponsorBlockSegmentItem } from "../types/api";

const TRACK_HEIGHT = 3;

type SegmentBarProps = {
  segment: SponsorBlockSegmentItem;
  duration: number;
};

function SegmentBar({ segment, duration }: SegmentBarProps) {
  const color = getSponsorBlockCategoryColor(segment.category);
  if (!color) return null;
  const startTime = getSponsorBlockStartTime(segment, duration);
  const endTime = getSponsorBlockEndTime(segment, duration);
  const left = (startTime / duration) * 100;
  const width = ((endTime - startTime) / duration) * 100;
  return (
    <div
      className="typetype-sponsorblock-segment"
      style={{
        position: "absolute",
        left: `${left}%`,
        width: `${width}%`,
        top: 0,
        bottom: 0,
        backgroundColor: color,
        opacity: 0.8,
        pointerEvents: "none",
      }}
    />
  );
}

type Props = { segments: SponsorBlockSegmentItem[] };

export function SponsorBlockBar({ segments }: Props) {
  const duration = useMediaState("duration");
  const controlsVisible = useMediaState("controlsVisible");
  const anchorRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    const overlay = overlayRef.current;
    if (!anchor || !overlay || !duration) return;
    if (!controlsVisible) return;

    const player = anchor.closest<HTMLElement>("[data-media-player]");
    if (!player) return;

    const sliders = [...player.querySelectorAll<HTMLElement>(".vds-time-slider")];
    const visibleSlider = () =>
      sliders.find((candidate) => {
        const rect = candidate.getBoundingClientRect();
        const style = getComputedStyle(candidate);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== "none" &&
          style.visibility !== "hidden"
        );
      }) ?? sliders[0];

    const update = () => {
      const slider = visibleSlider();
      if (!slider) return;
      const track = slider.querySelector<HTMLElement>(
        ".vds-slider-track:not(.vds-slider-track-fill):not(.vds-slider-progress)",
      );
      const pRect = player.getBoundingClientRect();
      const trackRect = (track ?? slider).getBoundingClientRect();
      const position = sponsorBlockBarPosition(pRect, trackRect, TRACK_HEIGHT);
      overlay.style.top = `${position.top}px`;
      overlay.style.left = `${position.left}px`;
      overlay.style.width = `${position.width}px`;
    };

    const ro = new ResizeObserver(update);
    ro.observe(player);
    for (const slider of sliders) {
      ro.observe(slider);
      const track = slider.querySelector<HTMLElement>(
        ".vds-slider-track:not(.vds-slider-track-fill):not(.vds-slider-progress)",
      );
      if (track) ro.observe(track);
    }
    const mo = new MutationObserver(update);
    mo.observe(player, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ["aria-hidden", "data-match", "data-sm", "data-visible"],
    });
    update();
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [controlsVisible, duration]);

  if (!duration || segments.length === 0) return null;

  return (
    <>
      <div ref={anchorRef} style={{ display: "none" }} />
      <div
        className="typetype-sponsorblock-bar"
        ref={overlayRef}
        style={{
          position: "absolute",
          height: `${TRACK_HEIGHT}px`,
          pointerEvents: "none",
          zIndex: 40,
          visibility: controlsVisible ? "visible" : "hidden",
        }}
      >
        {segments.map((seg) => (
          <SegmentBar key={`${seg.category}-${seg.startTime}`} segment={seg} duration={duration} />
        ))}
      </div>
    </>
  );
}

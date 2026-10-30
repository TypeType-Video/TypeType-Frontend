import { useId } from "react";

const STAR_POINTS =
  "0,-1 0.2245,-0.309 0.9511,-0.309 0.3633,0.118 0.5878,0.809 0,0.382 -0.5878,0.809 -0.3633,0.118 -0.9511,-0.309 -0.2245,-0.309";

export function SimplifiedChineseFlag() {
  const starId = useId();
  return (
    <span
      className="relative flex h-4 w-6 shrink-0 items-center justify-center overflow-hidden rounded-[2px] bg-[#de2910] ring-1 ring-black/15"
      aria-hidden="true"
    >
      <svg viewBox="0 0 30 20" className="h-full w-full" aria-hidden="true">
        <defs>
          <polygon id={starId} points={STAR_POINTS} fill="#ffde00" />
        </defs>
        <rect width="30" height="20" fill="#de2910" />
        <use href={`#${starId}`} transform="translate(5, 5) scale(3)" />
        <use href={`#${starId}`} transform="translate(10, 2) rotate(239.04)" />
        <use href={`#${starId}`} transform="translate(12, 4) rotate(261.87)" />
        <use href={`#${starId}`} transform="translate(12, 7) rotate(285.95)" />
        <use href={`#${starId}`} transform="translate(10, 9) rotate(308.66)" />
      </svg>
    </span>
  );
}

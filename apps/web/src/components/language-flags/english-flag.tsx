export function EnglishFlag() {
  return (
    <span
      className="relative h-4 w-6 shrink-0 overflow-hidden rounded-[2px] bg-white ring-1 ring-black/15"
      aria-hidden="true"
    >
      <span className="absolute left-0 top-[6px] h-1 w-full bg-[#d62828]" />
      <span className="absolute left-[10px] top-0 h-full w-1 bg-[#d62828]" />
    </span>
  );
}

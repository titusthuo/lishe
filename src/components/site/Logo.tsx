// The mark is the balanced plate the site teaches on /learn: half vegetables,
// a quarter staples, a quarter protein. Geometry is kept deliberately coarse
// (three wedges, one rim, no fine detail) so it stays legible at 24px in the
// header. Keep public/favicon.svg in sync with these proportions and colours.

const CREAM = "#FBFAF8";
const LEAF = "#2F5D3A";
const ENAMEL = "#1F4E8C";
const BRICK = "#A63D2F";

export function PlateMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="13.7" fill={CREAM} stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 4.2 A11.8 11.8 0 0 0 16 27.8 Z" fill={LEAF} />
      <path d="M16 4.2 A11.8 11.8 0 0 1 27.8 16 L16 16 Z" fill={ENAMEL} />
      <path d="M27.8 16 A11.8 11.8 0 0 1 16 27.8 L16 16 Z" fill={BRICK} />
      <path d="M16 4.2 V27.8 M16 16 H27.8" stroke={CREAM} strokeWidth="1.5" />
    </svg>
  );
}

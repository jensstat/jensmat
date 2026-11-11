// Small line icons used in several places. Each one is drawn on a 24×24 grid and takes
// its colour from the text (stroke="currentColor"), so `text-ink/60` on a parent colours it.
// The size comes from className (e.g. "h-5 w-5").
// aria-hidden: the icons are decoration; the button around them has the words
// (as text or an aria-label) for screen readers.

import type { ReactNode } from "react";

interface IconProps {
  className?: string;
}

function Icon({
  className = "h-5 w-5",
  strokeWidth,
  children,
}: IconProps & { strokeWidth: number; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// ✕: close a panel, clear the search, remove a filter
export function CloseIcon({ className }: IconProps) {
  return (
    <Icon className={className} strokeWidth={2}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

// ✓: a ticked option
export function CheckIcon({ className }: IconProps) {
  return (
    <Icon className={className} strokeWidth={2.5}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Icon>
  );
}

// ⌄: a section that opens and closes (turn it with rotate-180 when open)
export function ChevronDownIcon({ className }: IconProps) {
  return (
    <Icon className={className} strokeWidth={1.8}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}

// Two sliders: the "Filter" button
export function FilterIcon({ className }: IconProps) {
  return (
    <Icon className={className} strokeWidth={1.8}>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </Icon>
  );
}

// A magnifying glass: the search field
export function SearchIcon({ className }: IconProps) {
  return (
    <Icon className={className} strokeWidth={1.8}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </Icon>
  );
}

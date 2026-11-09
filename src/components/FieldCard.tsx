import type { ReactNode } from "react";

interface FieldCardProps {
  label: string;
  hint?: string;
  // children = whatever you put between <FieldCard> and </FieldCard>,
  // here the input or the select.
  children: ReactNode;
}

// The row that every field shares: label, a box with the field, and an optional hint under the box.
// Phones: label above the box. From sm: label left, box right (16rem wide).
// NumberField and SelectField only decide what goes inside the box.
function FieldCard({ label, hint, children }: FieldCardProps) {
  return (
    <label className="grid gap-1 py-3 sm:grid-cols-[1fr_16rem] sm:items-baseline sm:gap-6">
      <span>{label}</span>
      <span>
        <span className="flex border border-black px-3 py-2 focus-within:border-red-600 focus-within:ring-1 focus-within:ring-red-600">
          {children}
        </span>
        {hint && (
          <span className="mt-1 block text-sm text-neutral-600">{hint}</span>
        )}
      </span>
    </label>
  );
}

export default FieldCard;

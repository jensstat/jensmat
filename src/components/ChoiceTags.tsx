import { useId } from "react";
import type { SelectOption } from "./SelectField";

interface ChoiceTagsProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}

// A row of clickable tags where exactly one is chosen (like radio buttons).
// Same layout as FieldCard: label left, tags right (16rem), optional hint below.
//
// Under the hood each tag is a real radio button, hidden with sr-only.
// That way the keyboard (Tab + arrow keys) and screen readers work for free.
function ChoiceTags({ label, options, value, onChange, hint }: ChoiceTagsProps) {
  // useId makes an id that is unique on the page, even if the component is used twice.
  // It connects the label to the group, and gives the radio buttons a shared name.
  const id = useId();

  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[1fr_16rem] sm:items-baseline sm:gap-6">
      <span id={id}>{label}</span>
      <span>
        {/* Phones: side by side (the box is the full screen width).
            From sm:, the box is only 16rem wide, so the tags go on top of each other. */}
        <span role="radiogroup" aria-labelledby={id} className="grid grid-cols-2 gap-2 sm:grid-cols-1">
          {options.map((option) => (
            <label key={option.value} className="cursor-pointer">
              <input
                type="radio"
                name={id}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                // peer: lets the span below change style when this radio is checked or focused.
                className="peer sr-only"
              />
              {/* py-2.5: the same height as the input boxes */}
              <span className="block border border-black px-1 py-2.5 text-center text-sm uppercase transition-colors hover:bg-neutral-100 peer-checked:bg-black peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-red-600">
                {option.label}
              </span>
            </label>
          ))}
        </span>
        {hint && (
          <span className="mt-1 block text-sm text-neutral-600">{hint}</span>
        )}
      </span>
    </div>
  );
}

export default ChoiceTags;

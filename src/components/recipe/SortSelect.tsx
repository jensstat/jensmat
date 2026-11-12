import { useId } from "react";
import { sortOptions, type SortOrder } from "../../recipes/sort";
import { focusRing } from "../focusRing";
import { ChevronDownIcon } from "../icons";

interface SortSelectProps {
  value: SortOrder;
  onChange: (value: SortOrder) => void;
}

// "Sorter: [Nyeste ▾]" next to the view buttons on the overview. The browser's own
// <select>: on the phone it opens the phone's own list, easy to tap.
// Controlled: the page holds the order (in the address).
function SortSelect({ value, onChange }: SortSelectProps) {
  const id = useId();
  return (
    <div className="flex items-center gap-2 text-sm">
      {/* sr-only on phones: the row is tight there, and the list says what it is;
          screen readers still hear "Sorter" */}
      <label htmlFor={id} className="sr-only text-ink/60 sm:not-sr-only">
        Sorter
      </label>
      {/* appearance-none hides the browser's own arrow; ours sits on top (pointer-events-none,
          so a tap on it still opens the list) */}
      <div className="relative">
        <select
          id={id}
          value={value}
          // .find gives back an option from the list, so TypeScript knows it's a SortOrder
          onChange={(event) => {
            const chosen = sortOptions.find(
              (option) => option.value === event.target.value,
            );
            if (chosen) onChange(chosen.value);
          }}
          className={`h-10 appearance-none border border-ink/20 bg-white pr-8 pl-3 text-ink hover:border-ink ${focusRing}`}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-ink/60" />
      </div>
    </div>
  );
}

export default SortSelect;

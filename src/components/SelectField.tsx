import type { SelectOption } from "../pizza/settings";
import FieldCard from "./FieldCard";

interface SelectFieldProps {
  label: string;
  options: SelectOption[];
  value: string;
  // A function the page gives us. We call it with the chosen value when the user picks an option.
  onChange: (value: string) => void;
  hint?: string;
}

function SelectField({
  label,
  options,
  value,
  onChange,
  hint,
}: SelectFieldProps) {
  return (
    <FieldCard label={label} hint={hint}>
      {/* relative: the arrow below is placed relative to this wrapper */}
      <span className="relative block w-full">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-base outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Our own arrow, since appearance-none removes the browser's.
            pointer-events-none lets clicks go through to the select. */}
        <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-black">
          ▾
        </span>
      </span>
    </FieldCard>
  );
}

export default SelectField;

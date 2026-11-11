import { categories } from "../../recipes/types";
import type { Category } from "../../recipes/types";

interface CategoryChipsProps {
  value: Category | null; // the chosen category, or null for "Alle"
  onChange: (category: Category | null) => void;
}

// "Alle" first, then one chip per category from types.ts.
// One list means one button to write: "Alle" is just the option whose value is null.
const options: { value: Category | null; label: string }[] = [
  { value: null, label: "Alle" },
  ...categories.map((category) => ({ value: category, label: category })),
];

// Rounded chips for choosing a category. The chosen one is dark.
// flex-wrap: the chips move onto a new line when there's no more room (phones).
function CategoryChips({ value, onChange }: CategoryChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const chosen = value === option.value;
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={chosen}
            className={`rounded-full px-4 py-3 text-sm transition-colors ${
              chosen ? "bg-ink text-white" : "bg-panel hover:bg-ink/10"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryChips;

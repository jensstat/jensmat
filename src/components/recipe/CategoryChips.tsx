import { categories } from "../../recipes/types";
import type { Category } from "../../recipes/types";

interface CategoryChipsProps {
  value: string[]; // the ticked categories; [] = "Alle"
  onToggle: (category: Category) => void; // tick or untick one
  onClear: () => void; // "Alle": untick every category
}

// Rounded chips for the meal types: a quick shortcut to "Måltid" in the filter panel
// (the same state). Several can be on at once: Lunsj and Middag.
// "Alle" is on when none are ticked, and unticks them all.
// flex-wrap: the chips move onto a new line when there's no more room (phones).
function CategoryChips({ value, onToggle, onClear }: CategoryChipsProps) {
  const chipClass = (chosen: boolean) =>
    `rounded-full px-4 py-3 text-sm transition-colors ${
      chosen ? "bg-ink text-white" : "bg-panel hover:bg-ink/10"
    }`;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onClear}
        aria-pressed={value.length === 0}
        className={chipClass(value.length === 0)}
      >
        Alle
      </button>
      {categories.map((category) => {
        const chosen = value.includes(category);
        return (
          <button
            key={category}
            type="button"
            onClick={() => onToggle(category)}
            aria-pressed={chosen}
            className={chipClass(chosen)}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryChips;

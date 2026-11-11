import { tickedOptions, toggleOption } from "../../recipes/filter";
import type { RecipeFilters } from "../../recipes/filter";

interface ActiveFiltersProps {
  filters: RecipeFilters;
  onChange: (filters: RecipeFilters) => void;
}

// The options ticked in the filter panel, as small chips with a ✕ above the cards,
// so you can see (and remove) what's filtering the list without opening the panel.
// The meal types aren't here: the category chips already show them.
// Excluded ingredients say so: "Uten løk".
// Shows nothing when nothing is ticked.
function ActiveFilters({ filters, onChange }: ActiveFiltersProps) {
  const ticked = tickedOptions(filters).filter(
    ({ group }) => group.id !== "category",
  );
  if (ticked.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Valgte filtre">
      {ticked.map(({ group, option }) => {
        const label = group.combine === "none" ? `Uten ${option}` : option;
        return (
          <li key={`${group.id}:${option}`}>
            <button
              type="button"
              onClick={() => onChange(toggleOption(filters, group.id, option))}
              aria-label={`Fjern filteret ${label}`}
              className="flex min-h-11 items-center gap-1.5 rounded-full border border-ink/20 pr-3 pl-4 text-sm transition-colors hover:border-ink"
            >
              {label}
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-ink/60"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default ActiveFilters;

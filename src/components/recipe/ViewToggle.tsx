import type { ReactNode } from "react";
import type { RecipeView } from "./recipeView";

// Small icons for the buttons. fill="currentColor": they follow the text colour,
// so they turn white when the button is dark.
function LargeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="13" />
      <rect x="3" y="18" width="12" height="3" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="8" height="8" />
      <rect x="13" y="3" width="8" height="8" />
      <rect x="3" y="13" width="8" height="8" />
      <rect x="13" y="13" width="8" height="8" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="6" height="6" />
      <rect x="11" y="6" width="10" height="2" />
      <rect x="3" y="14" width="6" height="6" />
      <rect x="11" y="16" width="10" height="2" />
    </svg>
  );
}

// One entry per view: the value, the name (read by screen readers), and the icon.
// A third view later is one more line here (and a layout in the page).
const options: { value: RecipeView; label: string; icon: ReactNode }[] = [
  { value: "large", label: "Vis store kort", icon: <LargeIcon /> },
  { value: "standard", label: "Vis som rutenett", icon: <GridIcon /> },
  { value: "list", label: "Vis som liste", icon: <ListIcon /> },
];

interface ViewToggleProps {
  value: RecipeView;
  onChange: (view: RecipeView) => void;
}

// Icon buttons for choosing the view. The chosen one is dark.
function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex gap-1">
      {options.map((option) => {
        const chosen = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={chosen}
            aria-label={option.label}
            className={`p-3 transition-colors ${
              chosen ? "bg-ink text-white" : "text-ink/60 hover:text-ink"
            }`}
          >
            {option.icon}
          </button>
        );
      })}
    </div>
  );
}

export default ViewToggle;

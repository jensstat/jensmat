import { formatMinutes } from "../../recipes/display";
import LabelList from "./LabelList";

interface RecipeMetaProps {
  minutes?: number; // left out if the recipe has no time yet
  servings?: number; // left out if the recipe has no portions yet
  labels: string[];
}

// Small line icons, drawn in the text colour (currentColor). aria-hidden: the text says the same.
function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  );
}

function PlateIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}

// The key facts in one calm line: time, portions, and the labels (Fisk, Rask …).
// Each part is only shown when the recipe has it. With nothing to show, nothing is drawn.
function RecipeMeta({ minutes, servings, labels }: RecipeMetaProps) {
  if (minutes === undefined && servings === undefined && labels.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-base text-ink/70">
      {minutes !== undefined && (
        <span className="flex items-center gap-2">
          <ClockIcon />
          {formatMinutes(minutes)}
        </span>
      )}
      {servings !== undefined && (
        <span className="flex items-center gap-2">
          <PlateIcon />
          {servings} porsjoner
        </span>
      )}
      <LabelList labels={labels} />
    </div>
  );
}

export default RecipeMeta;

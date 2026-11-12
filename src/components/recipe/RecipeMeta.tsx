import { formatMinutes } from "../../recipes/display";
import { difficulties, type Difficulty } from "../../recipes/types";
import LabelList from "./LabelList";

interface RecipeMetaProps {
  minutes?: number; // left out if the recipe has no time yet
  servings?: number; // left out if the recipe has no portions yet
  difficulty?: Difficulty; // left out if the recipe has no difficulty yet
  labels: string[];
}

// Small line icons, drawn in the text colour (currentColor). aria-hidden: the text says the same.
function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  );
}

function PlateIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}

// The difficulty as four small bars, filled up to the level: Superenkel = 1, Avansert = 4.
// The level is the place in the fixed list (types.ts), so the order there is the order here.
function DifficultyIcon({ difficulty }: { difficulty: Difficulty }) {
  const level = difficulties.indexOf(difficulty) + 1;
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      {[1, 2, 3, 4].map((bar) => (
        <rect
          key={bar}
          x={bar * 5 - 3}
          y={20 - bar * 4}
          width="3.5"
          height={bar * 4}
          rx="1"
          fill="currentColor"
          opacity={bar <= level ? 1 : 0.25}
        />
      ))}
    </svg>
  );
}

// The key facts in one calm line: time, portions, difficulty, and the labels (Fisk, Rask …).
// Each part is only shown when the recipe has it. With nothing to show, nothing is drawn.
function RecipeMeta({
  minutes,
  servings,
  difficulty,
  labels,
}: RecipeMetaProps) {
  if (
    minutes === undefined &&
    servings === undefined &&
    difficulty === undefined &&
    labels.length === 0
  )
    return null;

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
      {difficulty !== undefined && (
        <span className="flex items-center gap-2">
          <DifficultyIcon difficulty={difficulty} />
          {difficulty}
        </span>
      )}
      <LabelList labels={labels} />
    </div>
  );
}

export default RecipeMeta;

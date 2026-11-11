import { useState } from "react";
import {
  countWithOption,
  mostUsedOptions,
  toggleOption,
} from "../../recipes/filter";
import type { FilterGroup, RecipeFilters } from "../../recipes/filter";
import type { Recipe } from "../../recipes/types";
import { focusRing } from "../focusRing";
import { CheckIcon, ChevronDownIcon } from "../icons";

interface FilterGroupSectionProps {
  group: FilterGroup; // one entry from filterGroups
  recipes: Recipe[]; // all of them, for the options and the counts
  filters: RecipeFilters;
  onChange: (filters: RecipeFilters) => void;
}

// A group with more options than this shows only the most used ones first,
// and a "Vis alle" button (the ingredients).
const shortListLength = 10;

// The groups that start open; the rest start closed, unless something in them is ticked.
const openFromStart = ["category", "protein", "time"];

// The hint under a group's heading, depending on how its options combine
function hintFor(group: FilterGroup, tickedCount: number) {
  if (group.combine === "all" && tickedCount > 1) return "Alle må passe";
  if (group.combine === "none") return "Skjuler oppskrifter med disse";
  return undefined;
}

// One group in the filter panel (FilterPanel draws one per entry in filterGroups):
// a heading you can open and close, and the options as chips with a count.
function FilterGroupSection({
  group,
  recipes,
  filters,
  onChange,
}: FilterGroupSectionProps) {
  const ticked = filters.chosen[group.id] ?? [];
  const [open, setOpen] = useState(
    openFromStart.includes(group.id) || ticked.length > 0,
  );
  const [showAll, setShowAll] = useState(false);
  const hint = hintFor(group, ticked.length);

  const options = group.options(recipes);
  const isLong = options.length > shortListLength;
  // Long groups: the most used options, plus any that are ticked (so they never hide).
  // The order stays alphabetical; only which ones are shown changes.
  const popular = isLong
    ? mostUsedOptions(recipes, group, shortListLength)
    : [];
  const shown =
    isLong && !showAll
      ? options.filter(
          (option) => popular.includes(option) || ticked.includes(option),
        )
      : options;

  return (
    // <details>/<summary>: the browser's own open/close, which works with the keyboard
    // (Enter/Space) and screen readers by itself. `open` is kept in state so a re-render
    // doesn't close it again.
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group border-b border-ink/10 last:border-b-0"
    >
      {/* -outline-offset-2: the focus ring is drawn inside, so the scroll area can't cut it off.
          list-none and the webkit rule hide the browser's own ▸ marker; we have the chevron. */}
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-3 hover:text-ink/70 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-medium tracking-wider uppercase">
          {group.label}
          {ticked.length > 0 && (
            <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-xs tracking-normal text-white">
              {ticked.length}
            </span>
          )}
        </span>
        {/* group-open: turns when the <details> (the "group" above) is open */}
        <ChevronDownIcon className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
      </summary>

      {hint && <p className="-mt-1 mb-3 text-sm text-ink/60">{hint}</p>}

      <div className="flex flex-wrap gap-2 pb-5">
        {shown.map((option) => (
          <OptionButton
            key={option}
            label={option}
            ticked={ticked.includes(option)}
            // How many recipes you'd see with it ticked (for "Uten": how many are left)
            count={countWithOption(recipes, filters, group, option)}
            onClick={() => onChange(toggleOption(filters, group.id, option))}
          />
        ))}
        {isLong && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className={`min-h-11 px-2 underline underline-offset-4 ${focusRing}`}
          >
            {showAll ? "Vis færre" : `Vis alle (${options.length})`}
          </button>
        )}
      </div>
    </details>
  );
}

// One option: a tappable chip (44px tall) with the count after the name.
// Ticked: dark, with a ✓ in front, so it's not only the colour that tells (for colour-blind
// people too). Greyed out when it would give 0 recipes, unless it's ticked (so you can untick it).
function OptionButton({
  label,
  ticked,
  count,
  onClick,
}: {
  label: string;
  ticked: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ticked}
      disabled={count === 0 && !ticked}
      className={`flex min-h-11 items-center gap-1.5 rounded-full text-sm transition-colors disabled:opacity-40 ${
        ticked
          ? "bg-ink pr-4 pl-3 text-white"
          : "bg-panel px-4 enabled:hover:bg-ink/10"
      } ${focusRing}`}
    >
      {ticked && <CheckIcon className="h-4 w-4" />}
      {label}
      {/* tabular-nums: every digit is equally wide, so the numbers don't jiggle as they change */}
      <span
        className={`text-xs tabular-nums ${ticked ? "text-white/60" : "text-ink/45"}`}
      >
        {count}
      </span>
    </button>
  );
}

export default FilterGroupSection;

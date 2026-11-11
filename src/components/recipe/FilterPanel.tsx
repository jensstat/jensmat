import { useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  countWithOption,
  filterGroups,
  toggleOption,
} from "../../recipes/filter";
import type { FilterGroup, RecipeFilters } from "../../recipes/filter";
import type { Recipe } from "../../recipes/types";

interface FilterPanelProps {
  recipes: Recipe[]; // all of them, for the options and the counts
  filters: RecipeFilters;
  onChange: (filters: RecipeFilters) => void;
  activeCount: number; // the number on the button: how many filters are on
  resultCount: number; // for "Vis 4 oppskrifter" at the bottom
}

// A group with more options than this shows only the most common ones first,
// and a "Vis alle" button (the ingredients).
const shortListLength = 10;

// The groups that start open; the rest start closed, unless something in them is ticked.
const openFromStart = ["category", "protein", "time"];

// A clear ring around whatever the keyboard (Tab) is on. focus-visible: only for the
// keyboard, not when you tap or click, so it doesn't flash on phones.
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

// The "Filter" button, and the panel it opens.
// The panel is the browser's own <dialog>, like the ingredient menu on the recipe page:
// showModal() puts it on top, keeps Tab inside it, and closes it on Esc.
// Everything you tick changes the page's filters right away; the button at the bottom
// just closes the panel. The groups come from filterGroups in recipes/filter.ts,
// so a new filter group shows up here by itself.
function FilterPanel({
  recipes,
  filters,
  onChange,
  activeCount,
  resultCount,
}: FilterPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();

  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      {/* Only the icon on phones (the search field needs the room), "Filter" from sm up.
          aria-label: screen readers always hear "Filter" and the number. */}
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label={activeCount > 0 ? `Filter, ${activeCount} valgt` : "Filter"}
        className={`relative flex min-w-12 shrink-0 items-center justify-center gap-2 border border-ink/20 bg-white px-3 text-base transition-colors hover:border-ink sm:px-4 ${focusRing}`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path d="M4 7h10M18 7h2M4 17h4M12 17h8" strokeLinecap="round" />
          <circle cx="16" cy="7" r="2" />
          <circle cx="10" cy="17" r="2" />
        </svg>
        <span className="hidden sm:inline">Filter</span>
        {activeCount > 0 && (
          // On phones a small badge on the icon's corner; from sm up next to the word
          <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-xs text-white sm:static sm:h-6 sm:min-w-6 sm:px-1.5 sm:text-sm">
            {activeCount}
          </span>
        )}
      </button>

      {/* Phones: a sheet from the bottom (mt-auto pushes it down), at most 90% of the screen.
          lg: a full-height panel on the right (ml-auto pushes it right).
          Slides up from below (phones) or in from the right (lg), and the dark backdrop fades:
          starting: gives the first frame when it opens (it comes from display: none),
          transition-discrete lets display/overlay wait until the slide-out is done.
          onClick on the <dialog> itself: a tap on the dark backdrop outside the panel
          lands on the dialog element, a tap inside lands on its content. */}
      <dialog
        ref={dialogRef}
        aria-labelledby={headingId}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-0 mt-auto max-h-[90dvh] w-full max-w-none translate-y-full rounded-t-2xl bg-white p-0 font-sans text-ink transition-[translate,display,overlay] transition-discrete duration-300 ease-out backdrop:bg-ink/40 backdrop:opacity-0 backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-300 open:translate-y-0 open:backdrop:opacity-100 starting:open:translate-y-full starting:open:backdrop:opacity-0 motion-reduce:transition-none motion-reduce:backdrop:transition-none lg:mt-0 lg:ml-auto lg:h-dvh lg:max-h-none lg:max-w-md lg:translate-x-full lg:translate-y-0 lg:rounded-none lg:open:translate-x-0 lg:starting:open:translate-x-full lg:starting:open:translate-y-0"
      >
        <div className="flex max-h-[90dvh] flex-col lg:h-full lg:max-h-none">
          <div className="flex items-center justify-between border-b border-ink/10 py-3 pr-2 pl-5">
            <h2 id={headingId} className="font-serif text-2xl font-semibold">
              Filter
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Lukk filter"
              className={`flex h-11 w-11 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-panel hover:text-ink ${focusRing}`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {/* The groups scroll; the heading and the buttons at the bottom stay put */}
          {/* min-h-0: lets this part shrink below its content, so it scrolls
              (flex items won't shrink smaller than their content by default) */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5">
            {filterGroups.map((group) => (
              <GroupOptions
                key={group.id}
                group={group}
                recipes={recipes}
                filters={filters}
                onChange={onChange}
              />
            ))}
          </div>
          {/* The shadow upwards: the groups look like they scroll in under the bar */}
          <div className="flex gap-3 border-t border-ink/10 px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-8px_16px_-8px_rgb(18_34_34/0.12)]">
            {/* Resets everything in the panel (the meal chips too); keeps the search */}
            <button
              type="button"
              onClick={() => onChange({ ...filters, chosen: {} })}
              disabled={activeCount === 0}
              className={`px-4 py-3 underline underline-offset-4 disabled:text-ink/30 disabled:no-underline ${focusRing}`}
            >
              Nullstill
            </button>
            <button
              type="button"
              onClick={close}
              className={`flex-1 bg-ink px-5 py-3 text-white transition-colors hover:bg-gold ${focusRing}`}
            >
              {resultCount === 0
                ? "Ingen oppskrifter"
                : `Vis ${resultCount} ${resultCount === 1 ? "oppskrift" : "oppskrifter"}`}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

// One group from filterGroups: a heading you can open and close, and its options.
// Long groups (the ingredients) show the most common options first, and "Vis alle".
function GroupOptions({
  group,
  recipes,
  filters,
  onChange,
}: {
  group: FilterGroup;
  recipes: Recipe[];
  filters: RecipeFilters;
  onChange: (filters: RecipeFilters) => void;
}) {
  const ticked = filters.chosen[group.id] ?? [];
  const [open, setOpen] = useState(
    openFromStart.includes(group.id) || ticked.length > 0,
  );
  const [showAll, setShowAll] = useState(false);
  const options = group.options(recipes);
  const isLong = options.length > shortListLength;

  // The short list: the options used in the most recipes (whatever is ticked,
  // so the list doesn't jump around while you tick), plus any that are ticked.
  let shown = options;
  if (isLong && !showAll) {
    const uses = new Map(
      options.map((option) => [
        option,
        // How many recipes have it, whatever is ticked (also for "Uten")
        recipes.filter((recipe) => group.matches(recipe, option)).length,
      ]),
    );
    const popular = [...options]
      .sort((a, b) => (uses.get(b) ?? 0) - (uses.get(a) ?? 0))
      .slice(0, shortListLength);
    shown = options.filter(
      (option) => popular.includes(option) || ticked.includes(option),
    );
  }

  const hint = {
    any: undefined,
    all: ticked.length > 1 ? "Alle må passe" : undefined,
    none: "Skjuler oppskrifter med disse",
  }[group.combine];

  return (
    <OptionSection
      label={group.label}
      tickedCount={ticked.length}
      hint={hint}
      open={open}
      onToggle={setOpen}
    >
      {shown.map((option) => (
        <OptionButton
          key={option}
          label={option}
          ticked={ticked.includes(option)}
          // For "Uten": how many recipes are left if you exclude it
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
    </OptionSection>
  );
}

// A heading that opens and closes the options under it (the browser's own
// <details>/<summary>, so it works with the keyboard and screen readers by itself).
function OptionSection({
  label,
  tickedCount,
  hint,
  open,
  onToggle,
  children,
}: {
  label: string;
  tickedCount: number;
  hint?: string;
  open: boolean;
  onToggle: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <details
      open={open}
      onToggle={(event) => onToggle(event.currentTarget.open)}
      className="group border-b border-ink/10 last:border-b-0"
    >
      {/* -outline-offset-2: the focus ring is drawn inside, so the scroll area can't cut it off */}
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-3 hover:text-ink/70 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-medium tracking-wider uppercase">
          {label}
          {tickedCount > 0 && (
            <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-xs tracking-normal text-white">
              {tickedCount}
            </span>
          )}
        </span>
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      {hint && <p className="-mt-1 mb-3 text-sm text-ink/60">{hint}</p>}
      <div className="flex flex-wrap gap-2 pb-5">{children}</div>
    </details>
  );
}

// One option: a tappable chip (44px tall) with the count after the name.
// Ticked: dark, with a ✓ in front (so it's not only the colour that tells, for colour-blind
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
      {ticked && (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
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

export default FilterPanel;

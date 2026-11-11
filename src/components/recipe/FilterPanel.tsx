import { useId, useRef } from "react";
import { filterGroups } from "../../recipes/filter";
import type { RecipeFilters } from "../../recipes/filter";
import type { Recipe } from "../../recipes/types";
import { focusRing } from "../focusRing";
import { CloseIcon, FilterIcon } from "../icons";
import FilterGroupSection from "./FilterGroupSection";

interface FilterPanelProps {
  recipes: Recipe[]; // all of them, for the options and the counts
  filters: RecipeFilters;
  onChange: (filters: RecipeFilters) => void;
  activeCount: number; // the number on the button: how many filters are on
  resultCount: number; // for "Vis 4 oppskrifter" at the bottom
}

// The panel's classes, in groups (joined into one string below).
// The panel is the browser's own <dialog>. When it's open, the browser gives it
// `position: fixed; inset: 0; margin: auto`, which centres it. A margin of `auto` on one
// side only pushes it to the opposite side instead.
const panelClasses = [
  // Phones: a sheet from the bottom (mt-auto pushes it down), at most 90% of the screen
  "m-0 mt-auto max-h-[90dvh] w-full max-w-none rounded-t-2xl bg-white p-0 font-sans text-ink",
  // lg: a full-height panel on the right (ml-auto pushes it right)
  "lg:mt-0 lg:ml-auto lg:h-dvh lg:max-h-none lg:max-w-md lg:rounded-none",
  // Sliding, phones: from below the screen (translate-y-full) to its place (translate-y-0).
  // starting: is the first frame when it opens (it comes from display: none, so it needs one).
  "translate-y-full open:translate-y-0 starting:open:translate-y-full",
  // Sliding, lg: from the right instead. Every phone class above needs an lg: partner in
  // the same state (normal, open:, starting:open:), or it leaks through and it slides diagonally.
  "lg:translate-x-full lg:translate-y-0 lg:open:translate-x-0 lg:starting:open:translate-x-full lg:starting:open:translate-y-0",
  // How it slides: 0.3 s. transition-discrete lets display and overlay (staying on top)
  // wait until the slide-out is done, instead of vanishing at once.
  "transition-[translate,display,overlay] transition-discrete duration-300 ease-out",
  // The dark backdrop behind it fades in and out the same way
  "backdrop:bg-ink/40 backdrop:opacity-0 open:backdrop:opacity-100 starting:open:backdrop:opacity-0",
  "backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-300",
  // No animation for people who've turned animations off on their device
  "motion-reduce:transition-none motion-reduce:backdrop:transition-none",
].join(" ");

// The "Filter" button, and the panel it opens.
// <dialog> with showModal(), like the ingredient menu on the recipe page: it's put on top,
// keeps Tab inside itself, and closes on Esc, without us writing that code.
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
        <FilterIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Filter</span>
        {activeCount > 0 && (
          // On phones a small badge on the icon's corner; from sm up next to the word
          <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-xs text-white sm:static sm:h-6 sm:min-w-6 sm:px-1.5 sm:text-sm">
            {activeCount}
          </span>
        )}
      </button>

      {/* onClick on the <dialog> itself closes it: a tap on the dark backdrop outside
          the panel lands on the dialog element, a tap inside lands on its content. */}
      <dialog
        ref={dialogRef}
        aria-labelledby={headingId}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className={panelClasses}
      >
        {/* Three parts: the heading, the groups (which scroll), and the buttons at the bottom */}
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
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>

          {/* min-h-0: lets this part shrink below its content, so it scrolls
              (flex items won't shrink smaller than their content by default) */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5">
            {filterGroups.map((group) => (
              <FilterGroupSection
                key={group.id}
                group={group}
                recipes={recipes}
                filters={filters}
                onChange={onChange}
              />
            ))}
          </div>

          {/* The shadow upwards: the groups look like they scroll in under the bar.
              The bottom padding adds the iPhone's home bar area (safe-area-inset-bottom). */}
          <div className="flex gap-3 border-t border-ink/10 px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-8px_16px_-8px_rgb(18_34_34/0.12)]">
            {/* Unticks everything (the meal chips too), but keeps the search */}
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

export default FilterPanel;

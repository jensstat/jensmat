import { useId, useRef, useState } from "react";
import ActiveFilters from "../components/recipe/ActiveFilters";
import CategoryChips from "../components/recipe/CategoryChips";
import FilterPanel from "../components/recipe/FilterPanel";
import RecipeCard from "../components/recipe/RecipeCard";
import RecipeSuggestion, {
  PizzaSuggestion,
} from "../components/recipe/RecipeSuggestion";
import ViewToggle from "../components/recipe/ViewToggle";
import type { RecipeView } from "../components/recipe/ViewToggle";
import {
  activeFilterCount,
  clearGroup,
  filterRecipes,
  noFilters,
  tickedOptions,
  toggleOption,
} from "../recipes/filter";
import type { RecipeFilters } from "../recipes/filter";
import { getAllRecipes } from "../recipes/recipes";
import { isPizzaDay, pickSuggestion } from "../recipes/suggest";

// The grid's classes for each view.
// Record<RecipeView, string>: TypeScript makes sure every view has a layout.
const layouts: Record<RecipeView, string> = {
  standard:
    "grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4",
  list: "grid gap-y-3 lg:grid-cols-2 lg:gap-x-10",
};

// Today's weekday: 0 = Sunday … 6 = Saturday.
// Reading the clock gives a different answer at different times, so it's only called
// once, as the starting value of the `day` state, never directly in the render.
function today() {
  return new Date().getDay();
}

// The overview of all recipes, at /oppskrifter. (One recipe is RecipePage.tsx.)
// The page holds the state (view and filters) and puts the pieces together;
// the pieces are in components/recipe/, and the filtering in recipes/filter.ts.
function RecipeListPage() {
  const recipes = getAllRecipes();
  const [view, setView] = useState<RecipeView>("standard");
  const [filters, setFilters] = useState<RecipeFilters>(noFilters);
  // The weekday, read from the clock once when the page opens. It's state (never changed),
  // so every render sees the same day, and the page and the suggestion always agree.
  // The page passes it in, so the functions in recipes/suggest.ts stay pure and testable.
  // To see another day while testing, write e.g. useState(() => 5) for a Friday.
  const [day] = useState(today);
  // "Hva med…?": picked once when the page opens, and again only when the button is pressed.
  // undefined if there are no complete recipes; then the suggestion isn't shown.
  // The rules (a complete dinner that suits the day, never the same twice) are in recipes/suggest.ts.
  const [suggestion, setSuggestion] = useState(() =>
    pickSuggestion(recipes, day),
  );
  // A handle on the search field, so the ✕ button can put the cursor back in it.
  const searchRef = useRef<HTMLInputElement>(null);
  const searchId = useId();

  // Calculated on every render from recipes and filters, never stored:
  // if you can calculate it, don't store it.
  const visibleRecipes = filterRecipes(recipes, filters);
  const searchText = filters.query.trim();
  const ticked = tickedOptions(filters);
  // For the message when nothing matches: only meal types ticked, or other filters too?
  const onlyCategories = ticked.every(({ group }) => group.id === "category");

  function clearSearch() {
    setFilters({ ...filters, query: "" });
    searchRef.current?.focus();
  }

  return (
    <section className="flex-1 bg-white font-sans text-ink">
      <div className="mx-auto w-full max-w-[93.75rem] px-5 py-8 lg:px-10 lg:py-12">
        <h1 className="font-serif text-[2rem] leading-tight font-semibold lg:text-[2.75rem]">
          Oppskrifter
        </h1>
        <p className="mt-2 text-lg font-light text-ink/70 lg:text-[1.375rem]">
          Finn noe godt å lage!
        </p>
        {/* The suggestion and the search field: the same width (set here, in one place),
            and gap-8 between them. A gap only appears between boxes that are there,
            so there's no extra space when there's no suggestion. */}
        <div className="mt-6 flex max-w-xl flex-col gap-8">
          {/* "Hva med…?": on Fridays pizza, on other days a recipe (if there is one to suggest) */}
          {isPizzaDay(day) ? (
            <PizzaSuggestion />
          ) : (
            suggestion && (
              <RecipeSuggestion
                recipe={suggestion}
                onShowAnother={() =>
                  setSuggestion(pickSuggestion(recipes, day, suggestion))
                }
              />
            )
          )}
          {/* The search field, and the "Filter" button on its right */}
          <div className="flex gap-2">
            {/* Search: the text is stored in filters.query, and filterRecipes does the searching.
              A magnifying glass on the left, and a ✕ on the right once something is typed. */}
            {/* min-w-0: lets the field shrink next to the Filter button on narrow phones */}
            <div className="relative min-w-0 flex-1">
              {/* The label is for screen readers; the shorter placeholder is for everyone else */}
              <label htmlFor={searchId} className="sr-only">
                Søk etter oppskrift eller ingrediens
              </label>
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-ink/50"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" strokeLinecap="round" />
              </svg>
              {/* text-base (16px): smaller text makes iPhones zoom in when you tap the field.
                The last class hides the browser's own ✕, since we have our own. */}
              <input
                ref={searchRef}
                id={searchId}
                type="search"
                enterKeyHint="search"
                value={filters.query}
                onChange={(event) =>
                  setFilters({ ...filters, query: event.target.value })
                }
                placeholder="Søk i oppskrifter"
                className="w-full border border-ink/20 bg-white py-3 pr-11 pl-11 text-base placeholder:text-ink/45 focus:border-ink focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
              />
              {filters.query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Tøm søket"
                  className="absolute top-1/2 right-0.5 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-ink/50 transition-colors hover:text-ink"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
            {/* The panel with every other filter (recipes/filter.ts: filterGroups) */}
            <FilterPanel
              recipes={recipes}
              filters={filters}
              onChange={setFilters}
              activeCount={activeFilterCount(filters)}
              resultCount={visibleRecipes.length}
            />
          </div>
        </div>
        <div className="mt-4">
          {/* The meal chips are a shortcut to "Måltid" in the filter panel (the same state) */}
          <CategoryChips
            value={filters.chosen.category ?? []}
            onToggle={(category) =>
              setFilters(toggleOption(filters, "category", category))
            }
            onClear={() => setFilters(clearGroup(filters, "category"))}
          />
        </div>
        {/* What's ticked in the panel, as chips you can remove */}
        <div className="mt-4">
          <ActiveFilters filters={filters} onChange={setFilters} />
        </div>
        {/* The number of recipes shown on the left, the view buttons on the right */}
        <div className="mt-8 flex items-center justify-between">
          {/* aria-live: screen readers hear the new number while you type */}
          <p aria-live="polite" className="text-sm text-ink/60">
            {visibleRecipes.length}{" "}
            {visibleRecipes.length === 1 ? "oppskrift" : "oppskrifter"}
          </p>
          <ViewToggle value={view} onChange={setView} />
        </div>
        {/* Either the cards, or a message when no recipe matches the filters */}
        {visibleRecipes.length === 0 ? (
          <div className="mt-4 bg-panel px-6 py-12 text-center">
            <p className="font-serif text-xl font-semibold">
              Fant ingen oppskrifter
            </p>
            <p className="mt-2 text-ink/70">
              {searchText
                ? `Ingen oppskrifter passer med «${searchText}»${ticked.length > 0 ? " og filtrene du har valgt" : ""}.`
                : ticked.length === 0
                  ? "Ingen oppskrifter ennå."
                  : onlyCategories
                    ? "Ingen oppskrifter i denne kategorien ennå."
                    : "Ingen oppskrifter passer med alle filtrene du har valgt."}
            </p>
            <button
              type="button"
              onClick={() => setFilters(noFilters)}
              className="mt-6 bg-ink px-5 py-3 text-sm text-white transition-colors hover:bg-gold"
            >
              Vis alle oppskrifter
            </button>
          </div>
        ) : (
          <ul className={`mt-4 ${layouts[view]}`}>
            {visibleRecipes.map((recipe) => (
              <li key={recipe.id}>
                <RecipeCard
                  recipe={recipe}
                  variant={view === "list" ? "row" : "card"}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default RecipeListPage;

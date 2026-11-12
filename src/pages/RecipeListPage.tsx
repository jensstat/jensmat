import { useState } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import ActiveFilters from "../components/recipe/ActiveFilters";
import CategoryChips from "../components/recipe/CategoryChips";
import FilterPanel from "../components/recipe/FilterPanel";
import RecipeCard from "../components/recipe/RecipeCard";
import RecipeSuggestion, {
  PizzaSuggestion,
} from "../components/recipe/RecipeSuggestion";
import SearchField from "../components/recipe/SearchField";
import ViewToggle from "../components/recipe/ViewToggle";
import type { RecipeView } from "../components/recipe/ViewToggle";
import type { recipeListLoader } from "../loaders";
import {
  activeFilterCount,
  clearGroup,
  filterRecipes,
  filtersFromParams,
  filtersToParams,
  noFilters,
  tickedOptions,
  toggleOption,
} from "../recipes/filter";
import type { RecipeFilters } from "../recipes/filter";
import { isPizzaDay, pickSuggestion } from "../recipes/suggest";

// The grid's classes for each view.
// Record<RecipeView, string>: TypeScript makes sure every view has a layout.
const layouts: Record<RecipeView, string> = {
  standard:
    "grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4",
  list: "grid gap-y-3 lg:grid-cols-2 lg:gap-x-10",
};

// The message when no recipe matches: names the search, and says whether it's
// the filters, only the meal types, or that there are no recipes at all.
function noResultsText(filters: RecipeFilters) {
  const searchText = filters.query.trim();
  const ticked = tickedOptions(filters);
  if (searchText) {
    const andFilters = ticked.length > 0 ? " og filtrene du har valgt" : "";
    return `Ingen oppskrifter passer med «${searchText}»${andFilters}.`;
  }
  if (ticked.length === 0) return "Ingen oppskrifter ennå.";
  if (ticked.every(({ group }) => group.id === "category"))
    return "Ingen oppskrifter i denne kategorien ennå.";
  return "Ingen oppskrifter passer med alle filtrene du har valgt.";
}

// Today's weekday: 0 = Sunday … 6 = Saturday.
// Reading the clock gives a different answer at different times, so it's only called
// once, as the starting value of the `day` state, never directly in the render.
function today() {
  return new Date().getDay();
}

// The overview of all recipes, at /oppskrifter. (One recipe is RecipePage.tsx.)
// The page holds the state (view, the day and the suggestion; the search and the
// filters are in the address) and puts the pieces together, top to bottom:
// heading, "Hva med…?", search + Filter button,
// meal chips, the chosen filters, the count + view buttons, and the cards.
// The pieces are in components/recipe/, and the filtering in recipes/filter.ts.
function RecipeListPage() {
  // The recipes, already fetched by the loader before the page is shown (loaders.ts).
  // <typeof recipeListLoader>: TypeScript gets the type from what the loader returns.
  const recipes = useLoaderData<typeof recipeListLoader>();
  // The query string of the address (?sok=laks …). The address is the state.
  const [searchParams, setSearchParams] = useSearchParams();
  // Every filter (the search too), read from the address on every render, never stored.
  // The recipes are passed in, so values that aren't an option are left out (filter.ts).
  const filters = filtersFromParams(searchParams, recipes);
  // Changing a filter = changing the address. Same name and shape as a useState setter,
  // so everything below that calls setFilters works as before.
  // - replace: true replaces the current step in the history instead of adding one
  //   (used while typing, so the back button isn't full of single letters).
  // - preventScrollReset: a new address normally scrolls to the top (ScrollRestoration
  //   in App.tsx); here it's the same page, so you stay where you were.
  function setFilters(newFilters: RecipeFilters, replace = false) {
    setSearchParams(filtersToParams(newFilters), {
      replace,
      preventScrollReset: true,
    });
  }
  const [view, setView] = useState<RecipeView>("standard");
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

  // Calculated on every render from recipes and filters, never stored:
  // if you can calculate it, don't store it.
  const visibleRecipes = filterRecipes(recipes, filters);

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
            {/* The text is in the address (?sok=), like every filter; filterRecipes does the searching.
                The first letter adds a step to the history; the next ones replace it
                (filters.query isn't empty any more), so one press on back clears the search. */}
            <SearchField
              value={filters.query}
              onChange={(query) =>
                setFilters({ ...filters, query }, filters.query !== "")
              }
            />
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
            <p className="mt-2 text-ink/70">{noResultsText(filters)}</p>
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

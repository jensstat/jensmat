import { useState } from "react";
import { useLoaderData, useLocation, useSearchParams } from "react-router";
import { useLoginHint } from "../auth/loginHint";
import Notice from "../components/Notice";
import { useNotice } from "../components/useNotice";
import ActiveFilters from "../components/recipe/ActiveFilters";
import CategoryChips from "../components/recipe/CategoryChips";
import FilterPanel from "../components/recipe/FilterPanel";
import RecipeCard from "../components/recipe/RecipeCard";
import type { CardVariant } from "../components/recipe/RecipeCard";
import RecipeSuggestion, {
  PizzaSuggestion,
} from "../components/recipe/RecipeSuggestion";
import SearchField from "../components/recipe/SearchField";
import SortSelect from "../components/recipe/SortSelect";
import ViewToggle from "../components/recipe/ViewToggle";
import { readSavedView, saveView } from "../components/recipe/recipeView";
import type { RecipeView } from "../components/recipe/recipeView";
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
  shownRecipes,
} from "../recipes/filter";
import type { RecipeFilters } from "../recipes/filter";
import {
  defaultSort,
  sortFromParams,
  sortParam,
  sortRecipes,
} from "../recipes/sort";
import type { SortOrder } from "../recipes/sort";
import { isPizzaDay, pickSuggestion } from "../recipes/suggest";

// The grid's classes for each view.
// Record<RecipeView, string>: TypeScript makes sure every view has a layout.
const layouts: Record<RecipeView, string> = {
  // Big cards: 1 per row on phones, 2 from 640 px, 3 from 1280 px
  large: "grid gap-y-10 sm:grid-cols-2 sm:gap-x-8 xl:grid-cols-3",
  standard:
    "grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4",
  list: "grid gap-y-3 lg:grid-cols-2 lg:gap-x-10",
};

// Which card each view uses (RecipeCard's variant)
const cardVariants: Record<RecipeView, CardVariant> = {
  large: "large",
  standard: "card",
  list: "row",
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
// From lg: the top is two columns: heading, search and chips on the left,
// "Hva med…?" as a big photo card on the right.
// The pieces are in components/recipe/, and the filtering in recipes/filter.ts.
function RecipeListPage() {
  // The recipes, already fetched by the loader before the page is shown (loaders.ts).
  // <typeof recipeListLoader>: TypeScript gets the type from what the loader returns.
  // Visitors don't see «Uferdig» recipes; the admin sees them all (filter.ts: shownRecipes)
  const isAdmin = useLoginHint();
  const recipes = shownRecipes(
    useLoaderData<typeof recipeListLoader>(),
    isAdmin,
  );
  // The query string of the address (?sok=laks …). The address is the state.
  const [searchParams, setSearchParams] = useSearchParams();
  // After «Slett oppskrift» in «Rediger», the editor comes here with the title in the
  // link's state: say it's done, for a few seconds
  const deleted: unknown = useLocation().state?.deleted;
  const [notice] = useNotice(
    typeof deleted === "string" ? `«${deleted}» er slettet` : undefined,
    4,
  );
  // Every filter (the search too), read from the address on every render, never stored.
  // The recipes are passed in, so values that aren't an option are left out (filter.ts).
  const filters = filtersFromParams(searchParams, recipes);
  // The order (Nyeste, A–Å, Raskest), also in the address (?sortering=raskest)
  const sort = sortFromParams(searchParams);
  // Writes the filters and the order to the address together, so changing one keeps the other.
  // The default order ("nyeste") isn't written, so a plain list keeps a plain address.
  function writeAddress(
    newFilters: RecipeFilters,
    newSort: SortOrder,
    replace = false,
  ) {
    const params = filtersToParams(newFilters);
    if (newSort !== defaultSort) params.set(sortParam, newSort);
    setSearchParams(params, { replace, preventScrollReset: true });
  }
  // Changing a filter = changing the address. Same name and shape as a useState setter,
  // so everything below that calls setFilters works as before.
  // - replace: true replaces the current step in the history instead of adding one
  //   (used while typing, so the back button isn't full of single letters).
  // - preventScrollReset: a new address normally scrolls to the top (ScrollRestoration
  //   in App.tsx); here it's the same page, so you stay where you were.
  function setFilters(newFilters: RecipeFilters, replace = false) {
    writeAddress(newFilters, sort, replace);
  }
  // The view (grid/list), remembered in this browser (components/recipe/recipeView.ts)
  const [view, setView] = useState(readSavedView);
  // Choosing a view: show it, and save it for next time
  function chooseView(newView: RecipeView) {
    setView(newView);
    saveView(newView);
  }
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

  // Calculated on every render from recipes, filters and order, never stored:
  // if you can calculate it, don't store it.
  const visibleRecipes = sortRecipes(filterRecipes(recipes, filters), sort);

  return (
    <section className="flex-1 bg-white font-sans text-ink">
      {/* The same width and side padding as the header (max-w-7xl, px-4 md:px-8),
          so the heading starts under the logo and the cards end under the menu. */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 lg:py-12">
        {/* The top. Phones and tablets: one column, in the order of the code
            (heading, suggestion, search + chips).
            From lg: two columns, the right one 26rem (34rem from xl), so the left one is wide
            enough for the meal chips on one line. The suggestion is placed in the right column,
            over all three rows (row-span-3), so it's as tall as the left column; the rest goes
            down the left column (col-start-1). The last row is 1fr: if the suggestion is ever
            taller, the extra height goes there, instead of spreading out the heading and the search. */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_26rem] lg:grid-rows-[auto_auto_1fr] xl:grid-cols-[minmax(0,1fr)_34rem] lg:gap-x-12">
          <div className="lg:col-start-1">
            <h1 className="font-serif text-[2rem] leading-tight font-semibold lg:text-[2.75rem]">
              Oppskrifter
            </h1>
            <p className="mt-2 text-lg font-light text-ink/70 lg:text-[1.375rem]">
              Finn noe godt å lage!
            </p>
          </div>
          {/* "Hva med…?": on Fridays pizza, on other days a recipe (if there is one to suggest) */}
          {(isPizzaDay(day) || suggestion) && (
            <div className="mt-6 max-w-xl lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:mt-0 lg:max-w-none">
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
            </div>
          )}
          {/* The search and the meal chips in one box. From lg the box is as wide as the
              chips on one line (w-fit: as wide as its widest child, the chip row), and the
              search row fills it, so the search + Filter end where "Tilbehør" ends.
              On phones and tablets the search is at most max-w-xl, and the chips wrap. */}
          <div className="mt-8 lg:col-start-1 lg:w-fit">
            {/* The search field, and the "Filter" button on its right */}
            <div className="flex max-w-xl gap-2 lg:max-w-none">
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
          </div>
        </div>
        {/* What's ticked in the panel, as chips you can remove */}
        <div className="mt-4">
          <ActiveFilters filters={filters} onChange={setFilters} />
        </div>
        {/* The number of recipes shown on the left; the order and the view buttons on the right */}
        <div className="mt-8 flex items-center justify-between gap-4">
          {/* aria-live: screen readers hear the new number while you type */}
          <p
            aria-live="polite"
            className="text-sm whitespace-nowrap text-ink/60"
          >
            {visibleRecipes.length}{" "}
            {visibleRecipes.length === 1 ? "oppskrift" : "oppskrifter"}
          </p>
          <div className="flex items-center gap-3 sm:gap-6">
            <SortSelect
              value={sort}
              onChange={(newSort) => writeAddress(filters, newSort)}
            />
            <ViewToggle value={view} onChange={chooseView} />
          </div>
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
                <RecipeCard recipe={recipe} variant={cardVariants[view]} />
              </li>
            ))}
          </ul>
        )}
      </div>
      {notice && <Notice message={notice} />}
    </section>
  );
}

export default RecipeListPage;

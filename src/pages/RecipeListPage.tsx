import { useId, useRef, useState } from "react";
import CategoryChips from "../components/recipe/CategoryChips";
import RecipeCard from "../components/recipe/RecipeCard";
import ViewToggle from "../components/recipe/ViewToggle";
import type { RecipeView } from "../components/recipe/ViewToggle";
import { filterRecipes, noFilters } from "../recipes/filter";
import type { RecipeFilters } from "../recipes/filter";
import { getAllRecipes } from "../recipes/recipes";

// The grid's classes for each view.
// Record<RecipeView, string>: TypeScript makes sure every view has a layout.
const layouts: Record<RecipeView, string> = {
  standard:
    "grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4",
  list: "grid gap-y-3 lg:grid-cols-2 lg:gap-x-10",
};

// The overview of all recipes, at /oppskrifter. (One recipe is RecipePage.tsx.)
// The page holds the state (view and filters) and puts the pieces together;
// the pieces are in components/recipe/, and the filtering in recipes/filter.ts.
function RecipeListPage() {
  const recipes = getAllRecipes();
  const [view, setView] = useState<RecipeView>("standard");
  const [filters, setFilters] = useState<RecipeFilters>(noFilters);
  // A handle on the search field, so the ✕ button can put the cursor back in it.
  const searchRef = useRef<HTMLInputElement>(null);
  const searchId = useId();

  // Calculated on every render from recipes and filters, never stored:
  // if you can calculate it, don't store it.
  const visibleRecipes = filterRecipes(recipes, filters);
  const searchText = filters.query.trim();

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

        {/* Search: the text is stored in filters.query, and filterRecipes does the searching.
            A magnifying glass on the left, and a ✕ on the right once something is typed. */}
        <div className="relative mt-8 max-w-xl">
          {/* The label is for screen readers; the placeholder says the same for everyone else */}
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
            placeholder="Søk etter oppskrift eller ingrediens"
            className="w-full border border-ink/20 bg-white py-3 pr-11 pl-11 text-base placeholder:text-ink/45 focus:border-ink focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
          />
          {filters.query && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Tøm søket"
              className="absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-ink/50 transition-colors hover:text-ink"
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

        <div className="mt-4">
          <CategoryChips
            value={filters.category}
            onChange={(category) => setFilters({ ...filters, category })}
          />
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
                ? `Ingen oppskrifter passer med «${searchText}»${filters.category ? ` i ${filters.category}` : ""}.`
                : "Ingen oppskrifter i denne kategorien ennå."}
            </p>
            <button
              type="button"
              onClick={() => setFilters(noFilters)}
              className="mt-6 bg-ink px-5 py-2.5 text-sm text-white transition-colors hover:bg-gold"
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

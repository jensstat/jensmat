import { useState } from "react";
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

        <div className="mt-8">
          <CategoryChips
            value={filters.category}
            onChange={(category) => setFilters({ ...filters, category })}
          />
        </div>

        {/* The number of recipes shown on the left, the view buttons on the right */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-ink/60">{visibleRecipes.length} oppskrifter</p>
          <ViewToggle value={view} onChange={setView} />
        </div>

        {/* Either the cards, or a message when no recipe matches the filters */}
        {visibleRecipes.length === 0 ? (
          <div className="mt-4 bg-panel px-6 py-12 text-center">
            <p className="font-serif text-xl font-semibold">Ingen oppskrifter her ennå</p>
            <p className="mt-2 text-ink/70">Ingen oppskrifter passer med det du har valgt.</p>
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
                <RecipeCard recipe={recipe} variant={view === "list" ? "row" : "card"} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default RecipeListPage;

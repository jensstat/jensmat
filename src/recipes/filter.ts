// Which recipes to show in the overview, based on the chosen filters.
// Only logic, no React, so it can be tested on its own (see filter.test.ts).

import type { Category, Recipe } from "./types";

// All the filters on the overview page. One object, so new filters (like search)
// are one more field here, and one more rule in filterRecipes below.
export interface RecipeFilters {
  category: Category | null; // null = "Alle"
  query: string; // "" = no search
}
// No filters chosen: every recipe is shown.
export const noFilters: RecipeFilters = { category: null, query: "" };

// The recipes that match every chosen filter. Gives a new list; the original is untouched.
// Search looks in the title, the description and the ingredient names.
// Recipes without a category are only shown under "Alle".
export function filterRecipes(
  recipes: Recipe[],
  filters: RecipeFilters,
): Recipe[] {
  // Cleaned once, before the loop: no spaces at the ends, and lower case,
  // so "  Laks" finds "laks". The field itself still shows what was typed.
  const query = filters.query.trim().toLowerCase();

  return recipes.filter((recipe) => {
    const categoryMatches =
      filters.category === null || recipe.category === filters.category;
    const queryMatches =
      recipe.title.toLowerCase().includes(query) ||
      // ?? "": a recipe without a description is searched as if it were empty text
      (recipe.description ?? "").toLowerCase().includes(query) ||
      recipe.ingredients.some((ingredient) =>
        ingredient.name.toLowerCase().includes(query),
      );
    return categoryMatches && queryMatches;
  });
}

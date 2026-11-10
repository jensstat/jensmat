// Which recipes to show in the overview, based on the chosen filters.
// Only logic, no React, so it can be tested on its own (see filter.test.ts).

import type { Category, Recipe } from "./types";

// All the filters on the overview page. One object, so new filters (like search)
// are one more field here, and one more rule in filterRecipes below.
export interface RecipeFilters {
  category: Category | null; // null = "Alle"
}

// No filters chosen: every recipe is shown.
export const noFilters: RecipeFilters = { category: null };

// The recipes that match every chosen filter. Gives a new list; the original is untouched.
export function filterRecipes(recipes: Recipe[], filters: RecipeFilters): Recipe[] {
  return recipes.filter(
    (recipe) => filters.category === null || recipe.category === filters.category,
  );
}

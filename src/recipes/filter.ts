// Which recipes to show in the overview, based on the chosen filters.
// Only logic, no React, so it can be tested on its own (see filter.test.ts).

import type { Category, Protein, Recipe } from "./types";

// All the filters on the overview page. One object, so new filters (like search)
// are one more field here, and one more rule in filterRecipes below.
export interface RecipeFilters {
  category: Category | null; // null = "Alle"
  query: string; // "" = no search
  proteins: Protein[]; // the ticked main ingredients; [] = no filter
}
// No filters chosen: every recipe is shown.
export const noFilters: RecipeFilters = {
  category: null,
  query: "",
  proteins: [],
};

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
    // "Or" within the group: the recipe's main ingredient is one of the ticked ones.
    // A recipe without a main ingredient is hidden as soon as one is ticked.
    const proteinMatches =
      filters.proteins.length === 0 ||
      (recipe.protein !== undefined &&
        filters.proteins.includes(recipe.protein));
    return categoryMatches && queryMatches && proteinMatches;
  });
}

// Every ingredient name in the recipes, each only once, sorted alphabetically.
// Used for the ingredient filter, so the options come from the recipes themselves
// and there's no list to keep up to date.
// The names are cleaned (lower case, no spaces at the ends) before the duplicates are
// removed, so "Løk" and "løk " count as the same ingredient as "løk".
export function ingredientNames(recipes: Recipe[]): string[] {
  const names = recipes.flatMap((recipe) =>
    recipe.ingredients.map((ingredient) =>
      ingredient.name.trim().toLowerCase(),
    ),
  );
  // A Set keeps each value only once; [...] turns it back into a normal array.
  // localeCompare with "nb": Norwegian alphabetical order, with æ, ø, å last.
  return [...new Set(names)].sort((a, b) => a.localeCompare(b, "nb"));
}

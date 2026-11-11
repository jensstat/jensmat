// The "Datasjekk": what each recipe is missing. A recipe can be posted half-done
// (see "Incomplete recipes" in docs/03-recipes.md), and that's fine, but a recipe
// without e.g. a cuisine won't show up when you filter on cuisine. This lists the gaps,
// so they're easy to find and fill in. Shown at /oppskrifter/datasjekk.
// Only logic, no React; it works on the Recipe type, so it works the same with a CMS.

import type { Recipe } from "./types";

interface Check {
  label: string; // what's missing, as shown on the Datasjekk page
  has: (recipe: Recipe) => boolean;
  // Only checked for some recipes. A dessert doesn't need a main ingredient.
  appliesTo?: (recipe: Recipe) => boolean;
}

// Everything worth filling in, in the order it's listed.
// To check a new field: add a line here (and in filterGroups, if it's a filter).
// Not here on purpose: tags ([] = none apply), steps (not every recipe needs them),
// occasions (missing = "Ukedag").
export const checks: Check[] = [
  { label: "Ingredienser", has: (recipe) => recipe.ingredients.length > 0 },
  { label: "Bilde", has: (recipe) => recipe.image !== undefined },
  {
    label: "Beskrivelse",
    has: (recipe) => (recipe.description ?? "").trim() !== "",
  },
  { label: "Måltid", has: (recipe) => recipe.category !== undefined },
  {
    label: "Hovedingrediens",
    has: (recipe) => recipe.protein !== undefined,
    // Desserts, baking and side dishes often don't have one
    appliesTo: (recipe) =>
      recipe.category === undefined ||
      ["Frokost", "Lunsj", "Middag"].includes(recipe.category),
  },
  { label: "Tid", has: (recipe) => recipe.minutes !== undefined },
  { label: "Porsjoner", has: (recipe) => recipe.servings !== undefined },
  {
    label: "Vanskelighetsgrad",
    has: (recipe) => recipe.difficulty !== undefined,
  },
  { label: "Kjøkken", has: (recipe) => recipe.cuisine !== undefined },
  // [] counts as filled in: you've decided none fit
  { label: "Passer til", has: (recipe) => recipe.themes !== undefined },
];

// What this recipe is missing, as labels: ["Bilde", "Kjøkken"]. [] = nothing missing.
export function missingInfo(recipe: Recipe): string[] {
  return checks
    .filter((check) => check.appliesTo?.(recipe) ?? true)
    .filter((check) => !check.has(recipe))
    .map((check) => check.label);
}

// Every recipe with what it's missing, the most missing first
// (ties keep their order). Recipes with nothing missing come last.
export function completenessReport(
  recipes: Recipe[],
): { recipe: Recipe; missing: string[] }[] {
  return recipes
    .map((recipe) => ({ recipe, missing: missingInfo(recipe) }))
    .sort((a, b) => b.missing.length - a.missing.length);
}

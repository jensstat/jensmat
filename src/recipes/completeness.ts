// The "Datasjekk": what each recipe is missing. A recipe can be posted half-done
// (see "Incomplete recipes" in docs/03-recipes.md), and that's fine, but a recipe
// without e.g. a cuisine won't show up when you filter on cuisine. This lists the gaps,
// so they're easy to find and fill in. Shown at /oppskrifter/datasjekk.
// Only logic, no React; it works on the Recipe type, so it works the same with a CMS.

import { cleanName } from "./filter";
import type { Recipe } from "./types";

interface Check {
  label: string; // what's missing, as shown on the Datasjekk page
  // Which field on the recipe it's about, so «Rediger» can jump straight to it
  // (/oppskrifter/laksewrap?rediger=cuisine)
  field: keyof Recipe;
  has: (recipe: Recipe) => boolean;
  // Only checked for some recipes. A dessert doesn't need a main ingredient.
  appliesTo?: (recipe: Recipe) => boolean;
}

// Everything worth filling in, in the order it's listed.
// To check a new field: add a line here (and in filterGroups, if it's a filter).
// Not here on purpose: tags ([] = none apply), steps (not every recipe needs them),
// occasions (missing = "Ukedag").
export const checks: Check[] = [
  {
    label: "Ingredienser",
    field: "ingredients",
    has: (recipe) => recipe.ingredients.length > 0,
  },
  {
    label: "Bilde",
    field: "image",
    has: (recipe) => recipe.image !== undefined,
  },
  {
    label: "Beskrivelse",
    field: "description",
    has: (recipe) => (recipe.description ?? "").trim() !== "",
  },
  {
    label: "Måltid",
    field: "category",
    has: (recipe) => recipe.category !== undefined,
  },
  {
    label: "Hovedingrediens",
    field: "protein",
    has: (recipe) => recipe.protein !== undefined,
    // Desserts, baking and side dishes often don't have one
    appliesTo: (recipe) =>
      recipe.category === undefined ||
      ["Frokost", "Lunsj", "Middag"].includes(recipe.category),
  },
  {
    label: "Tid",
    field: "minutes",
    has: (recipe) => recipe.minutes !== undefined,
  },
  {
    label: "Porsjoner",
    field: "servings",
    has: (recipe) => recipe.servings !== undefined,
  },
  {
    label: "Vanskelighetsgrad",
    field: "difficulty",
    has: (recipe) => recipe.difficulty !== undefined,
  },
  {
    label: "Kjøkken",
    field: "cuisine",
    has: (recipe) => recipe.cuisine !== undefined,
  },
  // [] counts as filled in: you've decided none fit
  {
    label: "Passer til",
    field: "themes",
    has: (recipe) => recipe.themes !== undefined,
  },
];

// What this recipe is missing, with the field each is about:
// [{ label: "Kjøkken", field: "cuisine" }]. [] = nothing missing.
export function missingFields(
  recipe: Recipe,
): { label: string; field: keyof Recipe }[] {
  return checks
    .filter((check) => check.appliesTo?.(recipe) ?? true)
    .filter((check) => !check.has(recipe))
    .map(({ label, field }) => ({ label, field }));
}

// What this recipe is missing, as labels: ["Bilde", "Kjøkken"]. [] = nothing missing.
export function missingInfo(recipe: Recipe): string[] {
  return missingFields(recipe).map((missing) => missing.label);
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

// ---------------------------------------------------------------------------
// Similar ingredient names
// ---------------------------------------------------------------------------
// The ingredient filter makes one option per name, so "tomat" and "tomater" become two
// options, and "Har tomat" misses the recipes that say "tomater". This finds names that
// are probably the same thing, so they're easy to make the same (see "Writing
// ingredients so the filter works" in docs/03-recipes.md).

// A name and the recipes that use it
export interface NameUse {
  name: string;
  recipes: Recipe[];
}

// Two names that look like the same ingredient
export type SimilarNames = [NameUse, NameUse];

// The word without its Norwegian endings: "tomater" → "tomat", "paprikaer" → "paprika",
// "tomatene" → "tomat", and a final -e, so "pære" and "pærer" both become "pær".
// Only when at least 3 letters are left, so short words aren't cut to nothing.
const endings = ["ene", "er", "e"];

function withoutEnding(name: string) {
  for (const ending of endings) {
    if (name.endsWith(ending) && name.length - ending.length >= 3) {
      return name.slice(0, -ending.length);
    }
  }
  return name;
}

// True if a and b differ by exactly one letter: one changed ("hvitløk"/"hvitlök"),
// one added or one removed ("pære"/"pærer").
function oneLetterApart(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++; // skip the start that's the same
  // After the first difference, the rest must match when one letter is skipped
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1);
  if (a.length > b.length) return a.slice(i + 1) === b.slice(i);
  return a.slice(i) === b.slice(i + 1);
}

// Short names can be one letter apart and still be different things ("salt"/"malt",
// "ris"/"rips"), so the one-letter rule is only used on names this long or longer.
const minLengthForOneLetter = 5;

export function areSimilarNames(a: string, b: string) {
  if (a === b) return false;
  if (withoutEnding(a) === withoutEnding(b)) return true;
  return (
    Math.min(a.length, b.length) >= minLengthForOneLetter &&
    oneLetterApart(a, b)
  );
}

// Every pair of similar names, each with the recipes that use it.
// Names are cleaned first (lower case, trimmed), like in the filter.
export function similarIngredientNames(recipes: Recipe[]): SimilarNames[] {
  // name → the recipes that use it (a Map keeps the names in the order they're found)
  const uses = new Map<string, Recipe[]>();
  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const name = cleanName(ingredient.name);
      const list = uses.get(name) ?? [];
      if (!list.includes(recipe)) list.push(recipe);
      uses.set(name, list);
    }
  }

  // Compare every name with every name after it (each pair once), in Norwegian order
  const names = [...uses.keys()].sort((a, b) => a.localeCompare(b, "nb"));
  const pairs: SimilarNames[] = [];
  names.forEach((a, index) => {
    for (const b of names.slice(index + 1)) {
      if (areSimilarNames(a, b)) {
        pairs.push([
          { name: a, recipes: uses.get(a) ?? [] },
          { name: b, recipes: uses.get(b) ?? [] },
        ]);
      }
    }
  });
  return pairs;
}

// What a recipe is: the fields, and the fixed lists of values some fields can have.
// Only types and data, no React. The same shape will exist in a CMS or database later.

// ---------------------------------------------------------------------------
// Fixed lists of values
// ---------------------------------------------------------------------------
// Each list is written once, as an array. The type is made from the array:
// - the array can be looped over (for filter buttons, dropdowns …)
// - the type makes TypeScript complain if a recipe uses a value that isn't in the list
//
// as const: "this list never changes, and these are the exact values" (not just "some strings").
// (typeof categories)[number]: "the type of any element in the list", i.e. "Frokost" | "Lunsj" | …

// What kind of meal it is.
export const categories = [
  "Frokost",
  "Lunsj",
  "Middag",
  "Dessert",
  "Bakst",
  "Tilbehør",
] as const;
export type Category = (typeof categories)[number];

// The main ingredient. Exactly one per recipe, so it's a field and not a tag.
// Optional on the recipe: desserts and baking often don't have one.
export const proteins = [
  "Kylling",
  "Kjøtt",
  "Fisk",
  "Sjømat",
  "Vegetar",
  "Vegansk",
] as const;
export type Protein = (typeof proteins)[number];

// Properties a recipe can have several of, or none.
// "Rask" (quick) isn't here: it's worked out from minutes (see isQuick at the bottom).
export const tags = ["Glutenfri", "Laktosefri", "Barnevennlig"] as const;
export type Tag = (typeof tags)[number];

// ---------------------------------------------------------------------------
// The recipe
// ---------------------------------------------------------------------------

export interface Ingredient {
  amount?: number; // optional: "salt og pepper" has no amount
  unit?: string; // optional: "3 egg" has no unit. "g", "dl", "ss" …
  name: string; // kept clean ("løk"), so it can be searched and used in a shopping list
  note?: string; // "finhakket", "romtemperert" … shown after the name
  // Optional: ingredients for one part of the dish, like "Til dippen" or "Saus".
  // Ingredients with the same group are shown together under that heading.
  // Ingredients without a group come first, under no heading.
  group?: string;
}

// A recipe can be saved half-done (from the phone: maybe just a title and a photo)
// and filled in later. So only the title is required content:
// - id and createdAt are required too, but they're technical (a CMS makes them).
// - Lists (tags, ingredients, steps) are always there, but may be empty: [] means "none yet".
//   The code can then always write recipe.steps.map(...) without checking first.
// - Everything else is optional (?), and every page must handle it being missing.
export interface Recipe {
  id: string; // used in the address: /oppskrifter/pannekaker. Never change it once published.
  title: string; // the only content that must be filled in
  description?: string;
  image?: string; // not every recipe has a photo yet. A file path now, a web address later.
  category?: Category;
  protein?: Protein;
  tags: Tag[]; // [] if none apply
  servings?: number; // how many portions the amounts are for
  minutes?: number; // total time
  ingredients: Ingredient[]; // [] = not added yet
  steps: string[]; // [] = no steps (not every recipe needs them)
  createdAt: string; // date as text, "2026-11-09" (the ISO format: year-month-day, sorts correctly as text)
  source?: string; // where the recipe comes from: "Mormor", a cookbook, a web address
  tips?: string; // your own notes
}

// ---------------------------------------------------------------------------
// Worked out from a recipe (not stored)
// ---------------------------------------------------------------------------

// Recipes that take 30 minutes or less count as quick.
// Calculated from minutes, so it's never out of step with the time.
export const quickMinutes = 30;

// A recipe without a time is never "quick": we don't know.
export function isQuick(recipe: Recipe) {
  return recipe.minutes !== undefined && recipe.minutes <= quickMinutes;
}

// A recipe is incomplete ("Uferdig") until it has ingredients: without them you can't cook it.
// Steps are not required, since some recipes are just the ingredients.
// Calculated, not stored: it can never say "incomplete" about a recipe you've filled in.
// To change what counts as incomplete, this is the only place to change.
export function isIncomplete(recipe: Recipe) {
  return recipe.ingredients.length === 0;
}

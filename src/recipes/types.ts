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
}

export interface Recipe {
  id: string; // used in the address: /oppskrifter/pannekaker. Never change it once published.
  title: string;
  description: string;
  image?: string; // optional: not every recipe has a photo yet. A file path now, a web address later.
  category: Category;
  protein?: Protein;
  tags: Tag[]; // an empty list [] if none apply
  servings: number; // how many portions the amounts are for
  minutes: number; // total time
  ingredients: Ingredient[];
  steps: string[];
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

export function isQuick(recipe: Recipe) {
  return recipe.minutes <= quickMinutes;
}

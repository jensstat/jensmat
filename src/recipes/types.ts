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
export const tags = ["Glutenfri", "Laktosefri"] as const;
export type Tag = (typeof tags)[number];

// When a dinner suits: easy weekday food, or weekend food. A dinner can be both.
// Only used to pick the "Hva med…?" suggestion, never shown on the recipe,
// so it's its own field and not a tag (tags are shown as labels).
export const occasions = ["Ukedag", "Helgemat"] as const;
export type Occasion = (typeof occasions)[number];

// What the dish suits: the mood or the occasion ("Passer til" in the filter).
// A recipe can have several, or none. Shown as labels on the recipe, like the tags.
// Diet needs (Glutenfri, Laktosefri) are tags, not themes; time is worked out from minutes.
export const themes = [
  "Sunn",
  "Kos",
  "Gjester",
  "Barnevennlig",
  "Tradisjon",
  "Høytid",
  "Matpakke og tur",
] as const;
export type Theme = (typeof themes)[number];

// Which kitchen the dish comes from. One per recipe, optional: leave it out for
// everyday food that isn't really from anywhere. Add to the list when you need a new one.
export const cuisines = [
  "Norsk",
  "Nordisk",
  "Italiensk",
  "Fransk",
  "Spansk",
  "Gresk",
  "Meksikansk",
  "Amerikansk",
  "Indisk",
  "Thai",
  "Kinesisk",
  "Japansk",
  "Koreansk",
  "Midtøsten",
  "Fusion", // a mix of kitchens, like tandoori salmon in a wrap
] as const;
export type Cuisine = (typeof cuisines)[number];

// How hard the recipe is to make (the same four steps as Matprat).
export const difficulties = [
  "Superenkel",
  "Enkel",
  "Middels",
  "Avansert",
] as const;
export type Difficulty = (typeof difficulties)[number];

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
  image?: string; // not every recipe has a photo yet. A web address (Sanity's image service).
  // The important part of the photo (the hotspot chosen in the Studio): x from the left,
  // y from the top, each from 0 to 1. Kept in view when the photo is cut to fit a card.
  // Missing = the middle. See recipes/image.ts.
  imageFocus?: { x: number; y: number };
  category?: Category;
  protein?: Protein;
  cuisine?: Cuisine;
  difficulty?: Difficulty;
  tags: Tag[]; // [] if none apply
  // Missing = not filled in yet (shows in the Datasjekk); [] = none of them fit.
  themes?: Theme[];
  occasions?: Occasion[]; // only on dinners. Missing = ["Ukedag"] (see occasionsOf at the bottom)
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

// The time ranges in the filter, worked out from minutes (like isQuick), so there's
// nothing extra to fill in. Each range is "up to and including max minutes";
// the last has no max. The first range that fits is used.
export const timeRanges = [
  { label: "Under 20 min", max: 19 },
  { label: "20–40 min", max: 40 },
  { label: "40–60 min", max: 60 },
  { label: "Over 60 min", max: Infinity },
] as const;
export type TimeRange = (typeof timeRanges)[number]["label"];

// Which time range a recipe is in, or undefined if it has no time yet.
export function timeRangeOf(recipe: Recipe): TimeRange | undefined {
  const minutes = recipe.minutes;
  if (minutes === undefined) return undefined;
  return timeRanges.find((range) => minutes <= range.max)?.label;
}

// A recipe is incomplete ("Uferdig") until it has ingredients: without them you can't cook it.
// Steps are not required, since some recipes are just the ingredients.
// Calculated, not stored: it can never say "incomplete" about a recipe you've filled in.
// To change what counts as incomplete, this is the only place to change.
export function isIncomplete(recipe: Recipe) {
  return recipe.ingredients.length === 0;
}

// When a dinner suits. Every dinner is weekday food unless it says otherwise,
// so only weekend food needs marking: ["Helgemat"], or ["Ukedag", "Helgemat"] for both.
// The default lives here, in one place, so a recipe posted with just a title still works.
export const defaultOccasions: Occasion[] = ["Ukedag"];

export function occasionsOf(recipe: Recipe): Occasion[] {
  return recipe.occasions ?? defaultOccasions;
}

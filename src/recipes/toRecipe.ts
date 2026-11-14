// The border: data from outside (data.ts now, a CMS later) comes in here as `unknown`,
// and leaves as a real Recipe, or undefined if it can't be read.
// TypeScript only checks the code before it runs, not data that arrives while the site
// runs, so we check it ourselves, here, once. Everything inside the site can then trust
// that a Recipe really is a Recipe (for example that `ingredients` is always a list).
//
// The rule: be forgiving. Only a missing id or title makes a recipe unreadable.
// Anything else that's wrong (a category "Midag", a time that isn't a number) is
// left out, as if it wasn't filled in, so the recipe still shows and the Datasjekk
// asks for it.

import {
  categories,
  cuisines,
  difficulties,
  occasions,
  proteins,
  tags,
  themes,
  type Ingredient,
  type Recipe,
} from "./types";

// ---------------------------------------------------------------------------
// Small checks, one per kind of value
// ---------------------------------------------------------------------------

// An object we can read fields from (typeof null is "object" too, so that's checked).
// Arrays are objects in JavaScript, but never a recipe or an ingredient.
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Text, trimmed. Empty text ("" or "   ") counts as missing.
function text(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

// A number above 0 (portions, minutes, amounts). NaN, Infinity, "30" and -2 are missing.
function positiveNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

// One of the values in a fixed list (categories, cuisines …), or missing.
// `value is T`: when this says true, TypeScript knows the value is e.g. a Category.
function isOneOf<T extends string>(
  list: readonly T[],
  value: unknown,
): value is T {
  return (
    typeof value === "string" && (list as readonly string[]).includes(value)
  );
}

function oneOf<T extends string>(
  list: readonly T[],
  value: unknown,
): T | undefined {
  return isOneOf(list, value) ? value : undefined;
}

// A list of values from a fixed list: unknown values and doubles are left out.
// Not a list at all = undefined, so the caller decides what "missing" means.
function manyOf<T extends string>(
  list: readonly T[],
  value: unknown,
): T[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const known = value.filter((item) => isOneOf(list, item));
  return [...new Set(known)];
}

// A point on a photo: x and y, each a number from 0 to 1. Anything else is missing.
function focusPoint(value: unknown): { x: number; y: number } | undefined {
  if (!isObject(value)) return undefined;
  const { x, y } = value;
  const isFraction = (n: unknown): n is number =>
    typeof n === "number" && n >= 0 && n <= 1;
  return isFraction(x) && isFraction(y) ? { x, y } : undefined;
}

// A date written as year-month-day ("2026-11-09"), or missing.
// Sanity gives a full time ("2026-11-11T13:20:13Z", the ISO format with time and
// timezone); only the date part, the first 10 characters, is kept.
function date(value: unknown): string | undefined {
  const written = text(value);
  if (
    written === undefined ||
    !/^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:\d{2})?)?$/.test(written)
  ) {
    return undefined;
  }
  const day = written.slice(0, 10);
  return Number.isNaN(Date.parse(day)) ? undefined : day;
}

// ---------------------------------------------------------------------------
// One ingredient
// ---------------------------------------------------------------------------

// An ingredient needs a name; without one it's left out of the recipe.
export function toIngredient(raw: unknown): Ingredient | undefined {
  if (!isObject(raw)) return undefined;
  const name = text(raw.name);
  if (name === undefined) return undefined;
  const amount = positiveNumber(raw.amount);
  const amountMax = positiveNumber(raw.amountMax);
  return withoutMissing({
    amount,
    // Only a real range: there's an amount, and the max is above it.
    // "–300 g" or "300–200 g" is left as just the amount
    amountMax:
      amount !== undefined && amountMax !== undefined && amountMax > amount
        ? amountMax
        : undefined,
    unit: text(raw.unit),
    name,
    note: text(raw.note),
    group: text(raw.group),
  });
}

// ---------------------------------------------------------------------------
// One recipe
// ---------------------------------------------------------------------------

export function toRecipe(raw: unknown): Recipe | undefined {
  if (!isObject(raw)) return undefined;
  const id = text(raw.id);
  const title = text(raw.title);
  if (id === undefined || title === undefined) return undefined;

  return withoutMissing({
    id,
    title,
    description: text(raw.description),
    image: text(raw.image),
    // Only with a photo: a hotspot on no photo means nothing
    imageFocus: text(raw.image) ? focusPoint(raw.imageFocus) : undefined,
    category: oneOf(categories, raw.category),
    protein: oneOf(proteins, raw.protein),
    cuisine: oneOf(cuisines, raw.cuisine),
    difficulty: oneOf(difficulties, raw.difficulty),
    // The lists that are always there: missing becomes [] ("none yet")
    tags: manyOf(tags, raw.tags) ?? [],
    // These stay missing when missing: it means "not filled in yet" (see types.ts)
    themes: manyOf(themes, raw.themes),
    occasions: manyOf(occasions, raw.occasions),
    servings: positiveNumber(raw.servings),
    minutes: positiveNumber(raw.minutes),
    ingredients: listOf(raw.ingredients, toIngredient),
    steps: listOf(raw.steps, text),
    // A CMS always gives a date. Without one, "" sorts the recipe last (oldest).
    createdAt: date(raw.createdAt) ?? "",
    source: text(raw.source),
    tips: text(raw.tips),
  });
}

// Why a recipe can't be read, in Norwegian for the Datasjekk, or undefined if it can.
// The same rules as the start of toRecipe.
export function whyUnreadable(raw: unknown): string | undefined {
  if (!isObject(raw)) return "er ikke en oppskrift";
  if (text(raw.id) === undefined) return "mangler id";
  if (text(raw.title) === undefined) return "mangler tittel";
  return undefined;
}

// ---------------------------------------------------------------------------
// Many recipes
// ---------------------------------------------------------------------------

// A recipe that couldn't be read, so it can be named instead of crashing the page.
export interface SkippedRecipe {
  position: number; // 1 = the first in the list
  name: string; // the title or id if there is one, so it can be found
  problem: string; // "mangler tittel"
}

// Every recipe in a list through the border. Unreadable ones, and a second recipe
// with an id that's already used (two recipes can't have the same address), are skipped.
export function readRecipes(raws: unknown[]): {
  recipes: Recipe[];
  skipped: SkippedRecipe[];
} {
  const recipes: Recipe[] = [];
  const skipped: SkippedRecipe[] = [];
  const usedIds = new Set<string>();

  raws.forEach((raw, index) => {
    const recipe = toRecipe(raw);
    const position = index + 1;
    if (recipe === undefined) {
      skipped.push({
        position,
        name: nameOf(raw) ?? `nr. ${position}`,
        problem: whyUnreadable(raw) ?? "kunne ikke leses",
      });
    } else if (usedIds.has(recipe.id)) {
      skipped.push({
        position,
        name: recipe.title,
        problem: `har samme id som en annen oppskrift («${recipe.id}»)`,
      });
    } else {
      usedIds.add(recipe.id);
      recipes.push(recipe);
    }
  });

  return { recipes, skipped };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Each item through `read`; items that can't be read are left out. Not a list = [].
function listOf<T>(
  value: unknown,
  read: (item: unknown) => T | undefined,
): T[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => read(item))
    .filter((item): item is T => item !== undefined);
}

// Removes fields that are undefined, so a missing field is really missing
// ("description" in recipe is false), just like in a recipe typed into data.ts.
function withoutMissing<T extends object>(object: T): T {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined),
  ) as T;
}

// The title or id of something that couldn't be read, if it has one.
function nameOf(raw: unknown): string | undefined {
  if (!isObject(raw)) return undefined;
  return text(raw.title) ?? text(raw.id);
}

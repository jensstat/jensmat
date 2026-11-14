import type { Ingredient, Recipe } from "../recipes/types";
import {
  fromValues,
  sameIngredients,
  type IngredientValues,
} from "./ingredientLines";

// What «Rediger»'s form holds, as the form gives it: everything is text
// (a number field gives "40", an empty dropdown ""), and the checkboxes and
// steps are lists. RecipeEditor reads it from the form with FormData.
export interface EditValues {
  title: string;
  description: string;
  tips: string;
  source: string;
  servings: string;
  minutes: string;
  category: string;
  protein: string;
  cuisine: string;
  difficulty: string;
  tags: string[];
  themes: string[];
  occasions: string[];
  steps: string[];
  ingredients: IngredientValues[];
  // The photo's focus point, if one was chosen by tapping the photo (PhotoField)
  imageFocus?: FocusPoint;
}

// A point on the photo: x from the left, y from the top, each from 0 to 1
export interface FocusPoint {
  x: number;
  y: number;
}

// What to send to PATCH /api/recipes: only the fields that changed.
// A value means "set it", null means "remove it" (the API's rule, api/_changes.ts).
export type Changes = Partial<
  Record<
    keyof EditValues,
    string | number | string[] | Ingredient[] | FocusPoint | null
  >
>;

const textFields = ["title", "description", "tips", "source"] as const;
const numberFields = ["servings", "minutes"] as const;
const choiceFields = ["category", "protein", "cuisine", "difficulty"] as const;
const listFields = ["tags", "themes", "occasions"] as const;

// Compares the form with the recipe, field by field. Pure, so it can be tested.
// Every kind of field: an emptied field is removed (null), but only if the recipe had it.
export function recipeChanges(recipe: Recipe, values: EditValues): Changes {
  const changes: Changes = {};

  // Text: spaces at the start and end don't count. The title can't be removed
  // (it's the only required field), so an empty title is ignored
  for (const field of textFields) {
    const before = recipe[field] ?? "";
    const after = values[field].trim();
    if (after === before) continue;
    if (after !== "") changes[field] = after;
    else if (field !== "title") changes[field] = null;
  }

  // Whole numbers above 0. Anything else is ignored: the field itself
  // (min="1" step="1") stops the form from being sent with it
  for (const field of numberFields) {
    const before = recipe[field];
    const after = values[field].trim();
    if (after === "") {
      if (before !== undefined) changes[field] = null;
      continue;
    }
    const number = Number(after);
    if (!Number.isInteger(number) || number <= 0) continue;
    if (number !== before) changes[field] = number;
  }

  // Dropdowns: "" is the empty choice («—»)
  for (const field of choiceFields) {
    const before = recipe[field] ?? "";
    const after = values[field];
    if (after === before) continue;
    changes[field] = after === "" ? null : after;
  }

  // Checkboxes: the order doesn't matter. None ticked = removed
  for (const field of listFields) {
    const before = recipe[field] ?? [];
    const after = values[field];
    if (sameItems(before, after)) continue;
    changes[field] = after.length > 0 ? after : null;
  }

  // Steps: the order matters. Empty steps are left out
  const steps = values.steps.map((step) => step.trim()).filter(Boolean);
  if (steps.join("\n") !== recipe.steps.join("\n")) changes.steps = steps;

  // Ingredients: the order matters. Lines without a name are left out
  const ingredients = values.ingredients
    .map(fromValues)
    .filter((line) => line !== undefined);
  if (!sameIngredients(recipe.ingredients, ingredients)) {
    changes.ingredients = ingredients;
  }

  // The focus point: only when one was chosen, and it moved (more than a hair)
  const focus = values.imageFocus;
  const before = recipe.imageFocus;
  if (
    focus &&
    (!before ||
      Math.abs(focus.x - before.x) > 0.001 ||
      Math.abs(focus.y - before.y) > 0.001)
  ) {
    changes.imageFocus = focus;
  }

  return changes;
}

// The same items, in any order: ["Kos", "Sunn"] and ["Sunn", "Kos"]
function sameItems(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((item) => b.includes(item));
}

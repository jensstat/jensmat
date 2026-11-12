// How recipe data is shown as text: amounts, time and labels.
// Only logic, no React, so it can be tested on its own (see display.test.ts)
// and reused by the recipe page, the recipe cards and portion scaling.

import type { Ingredient, Recipe } from "./types";
import { isQuick, quickOption } from "./types";

// Common kitchen fractions, shown as fraction characters like in a cookbook.
const fractions: [number, string][] = [
  [1 / 4, "¼"],
  [1 / 3, "⅓"],
  [1 / 2, "½"],
  [2 / 3, "⅔"],
  [3 / 4, "¾"],
];

// Turns an amount into readable text: 0.5 → "½", 1.5 → "1 ½", 300 → "300", 1.2 → "1,2".
// Also handles "odd" numbers from portion scaling later, like 0.4999 → "½".
export function formatAmount(amount: number): string {
  // Larger amounts (grams, millilitres …) as whole numbers.
  if (amount >= 10) return String(Math.round(amount));

  const whole = Math.floor(amount);
  const rest = amount - whole;

  // Close to a whole number: 2.02 → "2", 1.97 → "2".
  if (rest < 0.05) return String(whole);
  if (rest > 0.95) return String(whole + 1);

  // Close to a common fraction: 0.5 → "½", 1.25 → "1 ¼".
  const fraction = fractions.find(([value]) => Math.abs(rest - value) < 0.05);
  if (fraction) return whole === 0 ? fraction[1] : `${whole} ${fraction[1]}`;

  // Otherwise one decimal, with a Norwegian comma: 1.2 → "1,2".
  return (Math.round(amount * 10) / 10).toLocaleString("nb-NO");
}

// Amount and unit together: "½ pose", "300 g", "4" (no unit), "" (no amount).
export function formatQuantity(amount?: number, unit?: string): string {
  if (amount === undefined) return "";
  return unit ? `${formatAmount(amount)} ${unit}` : formatAmount(amount);
}

// Minutes as readable time: 30 → "30 min", 60 → "1 t", 75 → "1 t 15 min".
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} t`;
  return `${hours} t ${rest} min`;
}

// The short line under a recipe card: "30 min · Middag".
// Leaves out what the recipe doesn't have yet: "Middag", "30 min", or "" for neither.
export function cardDetails(recipe: Recipe): string {
  const parts: string[] = [];
  if (recipe.minutes !== undefined) parts.push(formatMinutes(recipe.minutes));
  if (recipe.category) parts.push(recipe.category);
  return parts.join(" · ");
}

export interface IngredientGroup {
  title?: string; // undefined for the ingredients without a group
  ingredients: Ingredient[];
}

// Collects the ingredients into groups for showing: first the ones without a group,
// then each group ("Til dippen" …) in the order it first appears in the recipe.
export function groupIngredients(ingredients: Ingredient[]): IngredientGroup[] {
  const groups: IngredientGroup[] = [];
  for (const ingredient of ingredients) {
    let group = groups.find((g) => g.title === ingredient.group);
    if (!group) {
      group = { title: ingredient.group, ingredients: [] };
      groups.push(group);
    }
    group.ingredients.push(ingredient);
  }
  // The ungrouped ones first, even if a grouped ingredient happens to be written above them.
  return groups.sort((a, b) =>
    a.title === undefined ? -1 : b.title === undefined ? 1 : 0,
  );
}

// A short label on a recipe ("Fisk", "Italiensk", "Rask"), and where it links: the filter
// group (an id in filterGroups, filter.ts) and the option to tick there, so the label can
// link to the overview filtered on it. The option is usually the label itself; "Rask" ticks
// "Rask (inntil 30 min)" in "Tid". No group: plain text.
export interface RecipeLabel {
  label: string;
  group?: string;
  option?: string; // the option to tick, if it's not the same as the label
}

// The short labels shown on a recipe: main ingredient, cuisine (Italiensk …),
// "Rask" (worked out from the time), then the tags (Glutenfri …) and the themes
// ("Passer til": Barnevennlig, Kos …). The difficulty isn't a label: it's in the line
// with the time and portions (RecipeMeta), with its own icon.
export function recipeLabels(recipe: Recipe): RecipeLabel[] {
  return [
    ...(recipe.protein ? [{ label: recipe.protein, group: "protein" }] : []),
    ...(recipe.cuisine ? [{ label: recipe.cuisine, group: "cuisine" }] : []),
    ...(isQuick(recipe)
      ? [{ label: "Rask", group: "time", option: quickOption }]
      : []),
    ...recipe.tags.map((tag) => ({ label: tag, group: "properties" })),
    ...(recipe.themes ?? []).map((theme) => ({
      label: theme,
      group: "themes",
    })),
  ];
}

// A part of the recipe page that the phone's section bar can jump to (RecipeSectionNav).
// The id is the element's id on the page.
export interface RecipeSection {
  id: string;
  label: string;
}

// The parts this recipe has, in the order they're on the page. A half-done recipe
// has fewer: no ingredients, no "Ingredienser"; no steps, no "Slik gjør du".
export function recipeSections(recipe: Recipe): RecipeSection[] {
  const sections: RecipeSection[] = [];
  if (recipe.ingredients.length > 0)
    sections.push({ id: "ingredienser", label: "Ingredienser" });
  if (recipe.steps.length > 0)
    sections.push({ id: "slik-gjor-du", label: "Slik gjør du" });
  if (recipe.tips) sections.push({ id: "tips", label: "Tips" });
  else if (recipe.source) sections.push({ id: "tips", label: "Kilde" });
  return sections;
}

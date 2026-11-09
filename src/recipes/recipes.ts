import { recipes } from "./data";
// All the recipes, newest first.
// [...recipes] makes a copy, so sorting doesn't change the original list.
// localeCompare compares the dates as text; "2026-11-09" sorts correctly because it's year-month-day.
export function getAllRecipes() {
  return [...recipes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
// One recipe, or undefined if no recipe has that id.
export function getRecipe(id: string) {
  return recipes.find((recipe) => recipe.id === id);
}

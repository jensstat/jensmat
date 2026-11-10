import { describe, expect, it } from "vitest";
import { recipes } from "./data";

// Checks every recipe in data.ts. TypeScript already checks the shape (fields, categories …);
// these catch the mistakes TypeScript can't see. Run `npm test` after adding a recipe.
describe("every recipe in data.ts", () => {
  it("has a unique id", () => {
    const ids = recipes.map((recipe) => recipe.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(recipes)("$id: has an id that works in an address (lowercase, a-z, 0-9, -)", (recipe) => {
    expect(recipe.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it.each(recipes)("$id: has a date written as year-month-day", (recipe) => {
    expect(recipe.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(recipe.createdAt))).toBe(false);
  });

  it.each(recipes)("$id: has at least one ingredient and one step", (recipe) => {
    expect(recipe.ingredients.length).toBeGreaterThan(0);
    expect(recipe.steps.length).toBeGreaterThan(0);
  });

  it.each(recipes)("$id: has sensible numbers (portions, time, amounts above 0)", (recipe) => {
    expect(recipe.servings).toBeGreaterThan(0);
    expect(recipe.minutes).toBeGreaterThan(0);
    for (const ingredient of recipe.ingredients) {
      if (ingredient.amount !== undefined) expect(ingredient.amount).toBeGreaterThan(0);
    }
  });
});

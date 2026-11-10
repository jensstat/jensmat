import { describe, expect, it } from "vitest";
import { recipes } from "./data";

// Checks every recipe in data.ts. TypeScript already checks the shape (fields, categories …);
// these catch the mistakes TypeScript can't see. Run `npm test` after adding a recipe.
// A recipe may be incomplete (only a title), so most checks only apply to what's filled in.
describe("every recipe in data.ts", () => {
  it("has a unique id", () => {
    const ids = recipes.map((recipe) => recipe.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(recipes)(
    "$id: has an id that works in an address (lowercase, a-z, 0-9, -)",
    (recipe) => {
      expect(recipe.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    },
  );

  it.each(recipes)("$id: has a title (the one thing every recipe needs)", (recipe) => {
    expect(recipe.title.trim()).not.toBe("");
  });

  it.each(recipes)("$id: has a date written as year-month-day", (recipe) => {
    expect(recipe.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(recipe.createdAt))).toBe(false);
  });

  it.each(recipes)("$id: has no empty ingredient names or steps", (recipe) => {
    for (const ingredient of recipe.ingredients) {
      expect(ingredient.name.trim()).not.toBe("");
    }
    for (const step of recipe.steps) {
      expect(step.trim()).not.toBe("");
    }
  });

  it.each(recipes)(
    "$id: has sensible numbers (portions, time, amounts above 0)",
    (recipe) => {
      // Only checked when filled in: an incomplete recipe may have no portions or time yet.
      if (recipe.servings !== undefined)
        expect(recipe.servings).toBeGreaterThan(0);
      if (recipe.minutes !== undefined)
        expect(recipe.minutes).toBeGreaterThan(0);
      for (const ingredient of recipe.ingredients) {
        if (ingredient.amount !== undefined)
          expect(ingredient.amount).toBeGreaterThan(0);
      }
    },
  );
});

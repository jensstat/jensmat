import { describe, expect, it } from "vitest";
import { recipes } from "./data";
import { filterRecipes, noFilters } from "./filter";

describe("filterRecipes", () => {
  it("shows every recipe when no filter is chosen", () => {
    expect(filterRecipes(recipes, noFilters)).toEqual(recipes);
  });

  it("shows only the chosen category", () => {
    const dinners = filterRecipes(recipes, { category: "Middag" });
    expect(dinners.length).toBeGreaterThan(0);
    expect(dinners.every((recipe) => recipe.category === "Middag")).toBe(true);
  });

  it("gives an empty list when nothing matches, and leaves the original list untouched", () => {
    const before = recipes.length;
    expect(filterRecipes([], { category: "Middag" })).toEqual([]);
    expect(recipes.length).toBe(before);
  });
});

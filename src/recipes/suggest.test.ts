import { describe, expect, it } from "vitest";
import { pickSuggestion } from "./suggest";
import type { Recipe } from "./types";

// A made-up recipe with just a title, like in filter.test.ts.
// complete() gives it an ingredient, so it's not "Uferdig".
function makeRecipe(fields: Partial<Recipe>): Recipe {
  return {
    id: "test",
    title: "Testrett",
    tags: [],
    ingredients: [],
    steps: [],
    createdAt: "2026-01-01",
    ...fields,
  };
}
function complete(id: string): Recipe {
  return makeRecipe({ id, title: id, ingredients: [{ name: "salt" }] });
}

// The lowest and highest "dice rolls" Math.random can give
const lowest = () => 0;
const highest = () => 0.9999;

describe("pickSuggestion", () => {
  it("picks by the random number: lowest gives the first, highest the last", () => {
    const recipes = [complete("a"), complete("b"), complete("c")];
    expect(pickSuggestion(recipes, undefined, lowest)?.id).toBe("a");
    expect(pickSuggestion(recipes, undefined, highest)?.id).toBe("c");
  });

  it("works with the real Math.random", () => {
    const recipes = [complete("a"), complete("b")];
    expect(recipes).toContain(pickSuggestion(recipes));
  });

  it("never suggests an incomplete recipe", () => {
    const recipes = [makeRecipe({ id: "uferdig" }), complete("ferdig")];
    expect(pickSuggestion(recipes, undefined, lowest)?.id).toBe("ferdig");
    expect(pickSuggestion(recipes, undefined, highest)?.id).toBe("ferdig");
  });

  it("never suggests the current recipe again", () => {
    const recipes = [complete("a"), complete("b")];
    expect(pickSuggestion(recipes, recipes[0], lowest)?.id).toBe("b");
    expect(pickSuggestion(recipes, recipes[0], highest)?.id).toBe("b");
  });

  it("compares by id, so a new copy of the current recipe counts as the same", () => {
    const recipes = [complete("a"), complete("b")];
    expect(pickSuggestion(recipes, complete("a"), lowest)?.id).toBe("b");
  });

  it("keeps the current recipe when it's the only complete one", () => {
    const only = complete("a");
    expect(pickSuggestion([only, makeRecipe({ id: "uferdig" })], only)).toBe(
      only,
    );
  });

  it("gives undefined when there are no complete recipes", () => {
    expect(pickSuggestion([])).toBeUndefined();
    expect(pickSuggestion([makeRecipe({ title: "Fiskesuppe" })])).toBeUndefined();
  });
});

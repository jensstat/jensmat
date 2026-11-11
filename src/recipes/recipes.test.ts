import { describe, expect, it } from "vitest";
import { getAllRecipes, getRecipe, getSkippedRecipes } from "./recipes";

// The data layer answers with a Promise, like a fetch from a CMS: `await` waits for it.
describe("the data layer", () => {
  it("gives all the recipes, newest first", async () => {
    const recipes = await getAllRecipes();
    expect(recipes.length).toBeGreaterThan(0);
    const dates = recipes.map((recipe) => recipe.createdAt);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("gives one recipe by its id, or undefined", async () => {
    const [first] = await getAllRecipes();
    expect((await getRecipe(first.id))?.title).toBe(first.title);
    expect(await getRecipe("finnes-ikke")).toBeUndefined();
  });

  it("skips nothing in data.ts", async () => {
    expect(await getSkippedRecipes()).toEqual([]);
  });
});

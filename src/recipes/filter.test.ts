import { describe, expect, it } from "vitest";
import { recipes } from "./data";
import { filterRecipes, noFilters } from "./filter";
import type { Recipe } from "./types";

// A made-up recipe for the tests. Give only the fields the test is about;
// the rest get default values. So the tests don't depend on the real
// recipes in data.ts, which will be replaced (and later come from a CMS).
// The defaults are only the required fields, so makeRecipe({ title: "…" })
// is a recipe with just a title, like one posted quickly from the phone.
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

describe("filterRecipes", () => {
  it("shows every recipe when no filter is chosen", () => {
    expect(filterRecipes(recipes, noFilters)).toEqual(recipes);
  });

  it("shows only the chosen category", () => {
    const dinners = filterRecipes(recipes, {
      ...noFilters,
      category: "Middag",
    });
    expect(dinners.length).toBeGreaterThan(0);
    expect(dinners.every((recipe) => recipe.category === "Middag")).toBe(true);
  });

  it("gives an empty list when nothing matches, and leaves the original list untouched", () => {
    const before = recipes.length;
    expect(filterRecipes([], { ...noFilters, category: "Middag" })).toEqual([]);
    expect(recipes.length).toBe(before);
  });

  it("shows a recipe without a category under 'Alle', but not under a category", () => {
    const noCategory = makeRecipe({ title: "Fiskesuppe" });
    expect(filterRecipes([noCategory], noFilters)).toEqual([noCategory]);
    expect(
      filterRecipes([noCategory], { ...noFilters, category: "Middag" }),
    ).toEqual([]);
  });
});

describe("search", () => {
  const wrap = makeRecipe({
    id: "wrap",
    title: "Laksewrap",
    description: "Tandoori-krydret laks i wrap",
    category: "Middag",
    ingredients: [{ name: "laks" }, { name: "Begby pølsesennep" }],
  });
  const lasagne = makeRecipe({
    id: "lasagne",
    title: "Lasagne",
    description: "Klassisk lasagne med kjøttsaus",
    category: "Middag",
    ingredients: [{ name: "kjøttdeig" }, { name: "hakkede tomater" }],
  });
  const mousse = makeRecipe({
    id: "mousse",
    title: "Sjokolademousse",
    category: "Dessert",
    ingredients: [{ name: "mørk sjokolade" }, { name: "egg" }],
  });
  const all = [wrap, lasagne, mousse];

  // A shorthand: search all three recipes for a text, with no category chosen.
  function search(query: string) {
    return filterRecipes(all, { ...noFilters, query });
  }

  it("finds a recipe by its title, whatever the case", () => {
    expect(search("LAKSE")).toEqual([wrap]);
  });

  it("finds a recipe by a word in the description", () => {
    expect(search("kjøttsaus")).toEqual([lasagne]);
  });

  it("finds a recipe by an ingredient, also inside longer names", () => {
    expect(search("tomat")).toEqual([lasagne]);
    expect(search("begby")).toEqual([wrap]);
  });

  it("shows each recipe only once, even if the text is found in several places", () => {
    // "sjokolade" is in both the title and an ingredient
    expect(search("sjokolade")).toEqual([mousse]);
  });

  it("ignores spaces at the ends, but keeps the ones in the middle", () => {
    expect(search("  lasagne  ")).toEqual([lasagne]);
    expect(search("hakkede tomater")).toEqual([lasagne]);
  });

  it("shows everything when the search is empty or only spaces", () => {
    expect(search("")).toEqual(all);
    expect(search("   ")).toEqual(all);
  });

  it("gives an empty list when nothing matches", () => {
    expect(search("taco")).toEqual([]);
  });

  it("combines search and category: both must match", () => {
    const dinnerEgg = filterRecipes(all, {
      ...noFilters,
      category: "Middag",
      query: "egg",
    });
    expect(dinnerEgg).toEqual([]); // egg is only in the dessert
    const dinnerLaks = filterRecipes(all, {
      ...noFilters,
      category: "Middag",
      query: "laks",
    });
    expect(dinnerLaks).toEqual([wrap]);
  });

  it("finds an incomplete recipe (only a title) by its title", () => {
    const soup = makeRecipe({ id: "soup", title: "Fiskesuppe" });
    expect(filterRecipes([soup, wrap], { ...noFilters, query: "suppe" })).toEqual([
      soup,
    ]);
    // ...and doesn't crash on the missing description when searching for something else
    expect(filterRecipes([soup, wrap], { ...noFilters, query: "laks" })).toEqual([
      wrap,
    ]);
  });
});

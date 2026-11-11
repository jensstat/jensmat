// Only for the tests (*.test.ts): a made-up recipe.
// Give only the fields the test is about; the rest get default values. Then the tests
// don't depend on the real recipes in data.ts, which will be replaced (and later come
// from a CMS). The defaults are only the required fields, so makeRecipe({ title: "…" })
// is a recipe with just a title, like one posted quickly from the phone.

import type { Recipe } from "./types";

export function makeRecipe(fields: Partial<Recipe> = {}): Recipe {
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

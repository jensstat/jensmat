import { beforeEach, describe, expect, it, vi } from "vitest";
import { recipes as testRecipes } from "./data";
import {
  getAllRecipes,
  getRecipe,
  getSkippedRecipes,
  RecipesUnavailableError,
} from "./recipes";

// The tests never ask the real Sanity: they'd need the internet, and they'd depend on
// what's published today. Instead the client is swapped for a fake (a mock), and each
// test decides what the fake answers. Normally: the recipes in data.ts.
// vi.hoisted: vi.mock is moved to the top of the file, before the imports, so the
// fake must be made up there too.
// Two fakes, one per client, so a test can see which one was asked
const fakeFetch = vi.hoisted(() => vi.fn<() => Promise<unknown>>());
const fakeFreshFetch = vi.hoisted(() => vi.fn<() => Promise<unknown>>());
vi.mock("./sanityClient", () => ({
  sanity: { fetch: fakeFetch },
  sanityFresh: { fetch: fakeFreshFetch },
}));
// The login note, so a test can pretend to be logged in
const fakeLoginHint = vi.hoisted(() => vi.fn(() => false));
vi.mock("../auth/loginHint", () => ({ hasLoginHint: fakeLoginHint }));

// Before every test: "the fetch worked, and Sanity answered with data.ts"
beforeEach(() => {
  fakeFetch.mockReset().mockResolvedValue(testRecipes);
  fakeFreshFetch.mockReset().mockResolvedValue(testRecipes);
  fakeLoginHint.mockReturnValue(false);
});

describe("which client the data layer asks", () => {
  it("a visitor reads from the CDN", async () => {
    await getAllRecipes();
    expect(fakeFetch).toHaveBeenCalled();
    expect(fakeFreshFetch).not.toHaveBeenCalled();
  });

  it("logged in, it reads straight from Sanity", async () => {
    fakeLoginHint.mockReturnValue(true);
    await getAllRecipes();
    expect(fakeFreshFetch).toHaveBeenCalled();
    expect(fakeFetch).not.toHaveBeenCalled();
  });
});

describe("the data layer", () => {
  it("gives all the recipes, newest first", async () => {
    const recipes = await getAllRecipes();
    expect(recipes.length).toBe(testRecipes.length);
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

  it("skips a recipe without a title, and names it", async () => {
    fakeFetch.mockResolvedValue([
      { id: "fiskesuppe", title: "Fiskesuppe" },
      { id: "uten-tittel", title: null },
    ]);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect((await getAllRecipes()).map((recipe) => recipe.id)).toEqual([
      "fiskesuppe",
    ]);
    expect(await getSkippedRecipes()).toEqual([
      { position: 2, name: "uten-tittel", problem: "mangler tittel" },
    ]);
  });

  it("throws RecipesUnavailableError when Sanity can't be reached", async () => {
    fakeFetch.mockRejectedValue(new Error("Failed to fetch"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(getAllRecipes()).rejects.toThrow(RecipesUnavailableError);
  });

  it("throws RecipesUnavailableError when the answer isn't a list", async () => {
    fakeFetch.mockResolvedValue({ error: "?" });
    await expect(getAllRecipes()).rejects.toThrow(RecipesUnavailableError);
  });
});

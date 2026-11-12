import { describe, expect, it } from "vitest";
import { sortFromParams, sortRecipes } from "./sort";
import { makeRecipe } from "./testRecipe";

const titles = (recipes: { title: string }[]) => recipes.map((r) => r.title);

const recipes = [
  makeRecipe({ title: "Pannekaker", createdAt: "2026-11-10", minutes: 40 }),
  makeRecipe({ title: "Ålesuppe", createdAt: "2026-11-12" }),
  makeRecipe({ title: "Eggerøre", createdAt: "2026-11-11", minutes: 10 }),
  makeRecipe({ title: "Fiskesuppe", createdAt: "2026-11-09", minutes: 30 }),
];

describe("sortRecipes", () => {
  it("Nyeste: the newest first", () => {
    expect(titles(sortRecipes(recipes, "nyeste"))).toEqual([
      "Ålesuppe",
      "Eggerøre",
      "Pannekaker",
      "Fiskesuppe",
    ]);
  });

  it("A–Å: by title, with æ, ø, å last", () => {
    expect(titles(sortRecipes(recipes, "alfabetisk"))).toEqual([
      "Eggerøre",
      "Fiskesuppe",
      "Pannekaker",
      "Ålesuppe",
    ]);
  });

  it("Raskest: the shortest time first, recipes without a time last", () => {
    expect(titles(sortRecipes(recipes, "raskest"))).toEqual([
      "Eggerøre",
      "Fiskesuppe",
      "Pannekaker",
      "Ålesuppe",
    ]);
  });

  it("doesn't change the list it gets", () => {
    const before = titles(recipes);
    sortRecipes(recipes, "alfabetisk");
    expect(titles(recipes)).toEqual(before);
  });
});

describe("sortFromParams", () => {
  it("reads the order from the address", () => {
    expect(sortFromParams(new URLSearchParams("sortering=raskest"))).toBe(
      "raskest",
    );
  });

  it("gives Nyeste when there's none, or an unknown one", () => {
    expect(sortFromParams(new URLSearchParams(""))).toBe("nyeste");
    expect(sortFromParams(new URLSearchParams("sortering=pris"))).toBe(
      "nyeste",
    );
  });
});

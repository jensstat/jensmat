import { describe, expect, it } from "vitest";
import { readRecipes, toIngredient, toRecipe, whyUnreadable } from "./toRecipe";

describe("toRecipe", () => {
  it("reads a recipe with only an id and a title", () => {
    const recipe = toRecipe({ id: "fiskesuppe", title: "Fiskesuppe" });
    expect(recipe?.id).toBe("fiskesuppe");
    expect(recipe?.title).toBe("Fiskesuppe");
    expect(recipe?.ingredients).toEqual([]);
  });

  it("gives undefined without a title or an id", () => {
    expect(toRecipe({ id: "fiskesuppe" })).toBeUndefined();
    expect(toRecipe({ title: "Fiskesuppe" })).toBeUndefined();
  });

  it("gives undefined for things that aren't objects", () => {
    expect(toRecipe(null)).toBeUndefined();
    expect(toRecipe("Fiskesuppe")).toBeUndefined();
    expect(toRecipe(42)).toBeUndefined();
    expect(toRecipe([])).toBeUndefined();
  });

  it("trims the title, and an empty title counts as missing", () => {
    expect(toRecipe({ id: "a", title: "  Fiskesuppe " })?.title).toBe(
      "Fiskesuppe",
    );
    expect(toRecipe({ id: "a", title: "   " })).toBeUndefined();
    expect(toRecipe({ id: "", title: "Fiskesuppe" })).toBeUndefined();
  });

  it("gives the lists as [] when they're missing or not lists", () => {
    const recipe = toRecipe({ id: "a", title: "A", ingredients: "løk" });
    expect(recipe).toMatchObject({ tags: [], ingredients: [], steps: [] });
  });

  it("leaves out fields that are missing, so they're really missing", () => {
    const recipe = toRecipe({ id: "a", title: "A", description: "  " });
    expect(recipe).toEqual({
      id: "a",
      title: "A",
      tags: [],
      ingredients: [],
      steps: [],
      createdAt: "",
    });
    expect(recipe && "description" in recipe).toBe(false);
  });

  it("leaves out values that aren't in their fixed list", () => {
    const recipe = toRecipe({
      id: "a",
      title: "A",
      category: "Midag",
      protein: "Fisk",
      cuisine: "Marsiansk",
      difficulty: 3,
    });
    expect(recipe?.category).toBeUndefined();
    expect(recipe?.protein).toBe("Fisk");
    expect(recipe?.cuisine).toBeUndefined();
    expect(recipe?.difficulty).toBeUndefined();
  });

  it("keeps only known values in tags, themes and occasions, once each", () => {
    const recipe = toRecipe({
      id: "a",
      title: "A",
      tags: ["Glutenfri", "Sukkerfri", "Glutenfri"],
      themes: ["Kos", 7],
      occasions: [],
    });
    expect(recipe?.tags).toEqual(["Glutenfri"]);
    expect(recipe?.themes).toEqual(["Kos"]);
    // [] means "none fit", which is different from missing
    expect(recipe?.occasions).toEqual([]);
  });

  it("keeps themes and occasions missing when they're missing", () => {
    const recipe = toRecipe({ id: "a", title: "A" });
    expect(recipe?.themes).toBeUndefined();
    expect(recipe?.occasions).toBeUndefined();
  });

  it("leaves out numbers that aren't sensible numbers", () => {
    expect(toRecipe({ id: "a", title: "A", minutes: 30 })?.minutes).toBe(30);
    for (const bad of ["30", -5, 0, Number.NaN, Infinity, null]) {
      expect(toRecipe({ id: "a", title: "A", minutes: bad })?.minutes).toBe(
        undefined,
      );
    }
  });

  it("reads a date written as year-month-day, otherwise gives ''", () => {
    const read = (createdAt: unknown) =>
      toRecipe({ id: "a", title: "A", createdAt })?.createdAt;
    expect(read("2026-11-09")).toBe("2026-11-09");
    expect(read("9. november")).toBe("");
    expect(read("2026-13-45")).toBe("");
    expect(read(undefined)).toBe("");
  });

  it("leaves out ingredients without a name, and empty steps", () => {
    const recipe = toRecipe({
      id: "a",
      title: "A",
      ingredients: [{ name: "løk" }, { amount: 2 }, "salt", null],
      steps: ["Stek.", "  ", 4, " Server. "],
    });
    expect(recipe?.ingredients).toEqual([{ name: "løk" }]);
    expect(recipe?.steps).toEqual(["Stek.", "Server."]);
  });
});

describe("toIngredient", () => {
  it("reads every field, trimmed", () => {
    expect(
      toIngredient({
        amount: 1,
        unit: " dl ",
        name: " kesam",
        note: "eller crème fraiche",
        group: "Til dippen",
      }),
    ).toEqual({
      amount: 1,
      unit: "dl",
      name: "kesam",
      note: "eller crème fraiche",
      group: "Til dippen",
    });
  });

  it("keeps an ingredient with a bad amount, without the amount", () => {
    expect(toIngredient({ name: "salt", amount: "en klype" })).toEqual({
      name: "salt",
    });
  });
});

describe("whyUnreadable", () => {
  it("says what's missing, or nothing if the recipe can be read", () => {
    expect(whyUnreadable("tekst")).toBe("er ikke en oppskrift");
    expect(whyUnreadable({ title: "A" })).toBe("mangler id");
    expect(whyUnreadable({ id: "a" })).toBe("mangler tittel");
    expect(whyUnreadable({ id: "a", title: "A" })).toBeUndefined();
  });
});

describe("readRecipes", () => {
  it("keeps the readable recipes and names the ones it skips", () => {
    const { recipes, skipped } = readRecipes([
      { id: "a", title: "A" },
      { id: "b" },
      { title: "Uten id" },
      { id: "a", title: "Kopi av A" },
      { id: "c", title: "C" },
    ]);
    expect(recipes.map((recipe) => recipe.id)).toEqual(["a", "c"]);
    expect(skipped).toEqual([
      { position: 2, name: "b", problem: "mangler tittel" },
      { position: 3, name: "Uten id", problem: "mangler id" },
      {
        position: 4,
        name: "Kopi av A",
        problem: "har samme id som en annen oppskrift («a»)",
      },
    ]);
  });

  it("names something without a title or id by its position", () => {
    expect(readRecipes([42]).skipped).toEqual([
      { position: 1, name: "nr. 1", problem: "er ikke en oppskrift" },
    ]);
  });
});

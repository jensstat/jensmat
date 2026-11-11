import { describe, expect, it } from "vitest";
import { completenessReport, missingInfo } from "./completeness";
import { makeRecipe } from "./testRecipe";

const complete = makeRecipe({
  id: "complete",
  description: "God mat",
  image: "/images/recipes/test.jpg",
  category: "Middag",
  protein: "Fisk",
  minutes: 30,
  servings: 2,
  difficulty: "Enkel",
  cuisine: "Norsk",
  themes: [],
  ingredients: [{ name: "laks" }],
});

describe("missingInfo", () => {
  it("lists nothing for a recipe that's filled in", () => {
    expect(missingInfo(complete)).toEqual([]);
  });

  it("lists everything for a recipe with only a title", () => {
    expect(missingInfo(makeRecipe({ title: "Fiskesuppe" }))).toEqual([
      "Ingredienser",
      "Bilde",
      "Beskrivelse",
      "Måltid",
      "Hovedingrediens",
      "Tid",
      "Porsjoner",
      "Vanskelighetsgrad",
      "Kjøkken",
      "Passer til",
    ]);
  });

  it("lists only what's missing", () => {
    expect(
      missingInfo({ ...complete, cuisine: undefined, image: undefined }),
    ).toEqual(["Bilde", "Kjøkken"]);
  });

  it("doesn't ask for a main ingredient on a dessert", () => {
    expect(
      missingInfo({ ...complete, category: "Dessert", protein: undefined }),
    ).toEqual([]);
  });

  it("counts themes: [] as filled in (none fit), and a missing list as not filled in", () => {
    expect(missingInfo({ ...complete, themes: [] })).toEqual([]);
    expect(missingInfo({ ...complete, themes: undefined })).toEqual([
      "Passer til",
    ]);
  });

  it("counts an empty description as missing", () => {
    expect(missingInfo({ ...complete, description: "  " })).toEqual([
      "Beskrivelse",
    ]);
  });
});

describe("completenessReport", () => {
  it("puts the recipes missing the most first", () => {
    const almost = { ...complete, id: "almost", cuisine: undefined };
    const onlyTitle = makeRecipe({ id: "onlyTitle" });
    const report = completenessReport([complete, almost, onlyTitle]);
    expect(report.map((row) => row.recipe.id)).toEqual([
      "onlyTitle",
      "almost",
      "complete",
    ]);
    expect(report[1].missing).toEqual(["Kjøkken"]);
  });
});

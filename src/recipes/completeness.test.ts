import { describe, expect, it } from "vitest";
import {
  areSimilarNames,
  completenessReport,
  missingFields,
  missingInfo,
  similarIngredientNames,
} from "./completeness";
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

describe("missingFields", () => {
  it("names the field each missing thing is about", () => {
    expect(
      missingFields({ ...complete, cuisine: undefined, image: undefined }),
    ).toEqual([
      { label: "Bilde", field: "image" },
      { label: "Kjøkken", field: "cuisine" },
    ]);
  });
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

describe("areSimilarNames", () => {
  it.each([
    ["tomat", "tomater"],
    ["paprika", "paprikaer"],
    ["tomater", "tomatene"],
    ["løk", "løker"],
    ["pære", "pærer"],
    ["kremfløte", "kremfløde"],
    ["hvitløk", "hvitlök"],
    ["sjalottløk", "sjalotløk"],
  ])("%s and %s are similar", (a, b) => {
    expect(areSimilarNames(a, b)).toBe(true);
    expect(areSimilarNames(b, a)).toBe(true);
  });

  it.each([
    ["løk", "rødløk"],
    ["løk", "hvitløk"],
    ["salt", "malt"],
    ["ris", "rips"],
    ["tomat", "hakkede tomater"],
    ["melk", "melk"],
    ["smør", "smørbrød"],
  ])("%s and %s are not similar", (a, b) => {
    expect(areSimilarNames(a, b)).toBe(false);
  });
});

describe("similarIngredientNames", () => {
  it("finds names that are almost the same, with the recipes that use each", () => {
    const wrap = makeRecipe({
      id: "wrap",
      ingredients: [{ name: "tomat" }, { name: "løk" }],
    });
    const taco = makeRecipe({
      id: "taco",
      ingredients: [{ name: "Tomater " }, { name: "løk" }],
    });
    const pairs = similarIngredientNames([wrap, taco]);
    expect(pairs).toEqual([
      [
        { name: "tomat", recipes: [wrap] },
        { name: "tomater", recipes: [taco] },
      ],
    ]);
  });

  it("lists a recipe once, even if it uses a name twice", () => {
    const lasagne = makeRecipe({
      ingredients: [{ name: "melk" }, { name: "melk", group: "Saus" }],
    });
    const grot = makeRecipe({ id: "grot", ingredients: [{ name: "melker" }] });
    expect(similarIngredientNames([lasagne, grot])[0][0].recipes).toEqual([
      lasagne,
    ]);
  });

  it("finds nothing when every name is written one way", () => {
    expect(
      similarIngredientNames([
        makeRecipe({ ingredients: [{ name: "løk" }, { name: "rødløk" }] }),
      ]),
    ).toEqual([]);
  });
});

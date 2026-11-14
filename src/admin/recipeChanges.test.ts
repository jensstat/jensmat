import { describe, expect, it } from "vitest";
import { recipeChanges, type EditValues } from "./recipeChanges";
import { makeRecipe } from "../recipes/testRecipe";
import { toValues } from "./ingredientLines";

const recipe = makeRecipe({
  title: "Laksewrap",
  description: "Rask og god",
  servings: 4,
  cuisine: "Fusion",
  themes: ["Kos", "Sunn"],
  steps: ["Stek laksen", "Fyll wrapene"],
  ingredients: [
    { amount: 300, unit: "g", name: "laks" },
    { amount: 0.5, name: "løk", note: "finhakket" },
    { amount: 1, unit: "dl", name: "kesam", group: "Til dippen" },
  ],
});

// The form as it is when nothing has been touched
const untouched: EditValues = {
  title: "Laksewrap",
  description: "Rask og god",
  tips: "",
  source: "",
  servings: "4",
  minutes: "",
  category: "",
  protein: "",
  cuisine: "Fusion",
  difficulty: "",
  tags: [],
  themes: ["Kos", "Sunn"],
  occasions: [],
  steps: ["Stek laksen", "Fyll wrapene"],
  ingredients: recipe.ingredients.map(toValues),
};

describe("recipeChanges", () => {
  it("gives nothing when nothing changed", () => {
    expect(recipeChanges(recipe, untouched)).toEqual({});
  });

  describe("text", () => {
    it("gives only the changed field", () => {
      expect(
        recipeChanges(recipe, { ...untouched, description: "Rask og sunn" }),
      ).toEqual({ description: "Rask og sunn" });
    });

    it("ignores spaces at the start and the end", () => {
      expect(
        recipeChanges(recipe, { ...untouched, title: "  Laksewrap " }),
      ).toEqual({});
    });

    it("adds a field the recipe didn't have", () => {
      expect(
        recipeChanges(recipe, { ...untouched, tips: "Bruk ferskt dill" }),
      ).toEqual({ tips: "Bruk ferskt dill" });
    });

    it("removes an emptied field (null)", () => {
      expect(
        recipeChanges(recipe, { ...untouched, description: "  " }),
      ).toEqual({ description: null });
    });

    it("never removes the title", () => {
      expect(recipeChanges(recipe, { ...untouched, title: "" })).toEqual({});
    });
  });

  describe("numbers", () => {
    it("reads the text as a number", () => {
      expect(
        recipeChanges(recipe, { ...untouched, servings: "2", minutes: "30" }),
      ).toEqual({ servings: 2, minutes: 30 });
    });

    it("removes an emptied number", () => {
      expect(recipeChanges(recipe, { ...untouched, servings: "" })).toEqual({
        servings: null,
      });
    });

    it("ignores what isn't a whole number above 0", () => {
      for (const minutes of ["0", "-5", "2.5", "abc"]) {
        expect(recipeChanges(recipe, { ...untouched, minutes })).toEqual({});
      }
    });
  });

  describe("dropdowns", () => {
    it("sets a new choice", () => {
      expect(
        recipeChanges(recipe, { ...untouched, difficulty: "Enkel" }),
      ).toEqual({ difficulty: "Enkel" });
    });

    it("removes it when «—» is chosen", () => {
      expect(recipeChanges(recipe, { ...untouched, cuisine: "" })).toEqual({
        cuisine: null,
      });
    });
  });

  describe("checkboxes", () => {
    it("doesn't care about the order", () => {
      expect(
        recipeChanges(recipe, { ...untouched, themes: ["Sunn", "Kos"] }),
      ).toEqual({});
    });

    it("sends the whole new list", () => {
      expect(
        recipeChanges(recipe, { ...untouched, themes: ["Kos", "Gjester"] }),
      ).toEqual({ themes: ["Kos", "Gjester"] });
    });

    it("removes the list when none are ticked", () => {
      expect(recipeChanges(recipe, { ...untouched, themes: [] })).toEqual({
        themes: null,
      });
    });
  });

  describe("ingredients", () => {
    it("sends the whole list when one line changed", () => {
      const ingredients = untouched.ingredients.map((line) =>
        line.name === "laks" ? { ...line, amount: "400" } : line,
      );
      expect(recipeChanges(recipe, { ...untouched, ingredients })).toEqual({
        ingredients: [
          { amount: 400, unit: "g", name: "laks" },
          { amount: 0.5, name: "løk", note: "finhakket" },
          { amount: 1, unit: "dl", name: "kesam", group: "Til dippen" },
        ],
      });
    });

    it("leaves out lines without a name", () => {
      const ingredients = [
        ...untouched.ingredients,
        { amount: "", unit: "", name: " ", note: "", group: "" },
      ];
      expect(recipeChanges(recipe, { ...untouched, ingredients })).toEqual({});
    });
  });

  describe("the photo's focus point", () => {
    it("sends a new point", () => {
      expect(
        recipeChanges(recipe, { ...untouched, imageFocus: { x: 0.2, y: 0.7 } }),
      ).toEqual({ imageFocus: { x: 0.2, y: 0.7 } });
    });

    it("sends nothing when the point didn't move", () => {
      const focused = makeRecipe({ ...recipe, imageFocus: { x: 0.2, y: 0.7 } });
      expect(
        recipeChanges(focused, {
          ...untouched,
          imageFocus: { x: 0.2, y: 0.7 },
        }),
      ).toEqual({});
    });
  });

  describe("steps", () => {
    it("sees a new order", () => {
      expect(
        recipeChanges(recipe, {
          ...untouched,
          steps: ["Fyll wrapene", "Stek laksen"],
        }),
      ).toEqual({ steps: ["Fyll wrapene", "Stek laksen"] });
    });

    it("leaves out empty steps, and trims the rest", () => {
      expect(
        recipeChanges(recipe, {
          ...untouched,
          steps: [" Stek laksen ", "", "Fyll wrapene", "  "],
        }),
      ).toEqual({});
    });

    it("can remove every step", () => {
      expect(recipeChanges(recipe, { ...untouched, steps: [] })).toEqual({
        steps: [],
      });
    });
  });
});

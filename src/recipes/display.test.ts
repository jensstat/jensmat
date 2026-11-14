import { describe, expect, it } from "vitest";
import {
  cardDetails,
  formatAmount,
  formatMinutes,
  formatQuantity,
  groupIngredients,
  recipeLabels,
  recipeSections,
} from "./display";
import { isIncomplete, isQuick } from "./types";
import type { Recipe } from "./types";

describe("formatAmount", () => {
  it("shows common fractions as fraction characters", () => {
    expect(formatAmount(0.25)).toBe("¼");
    expect(formatAmount(0.5)).toBe("½");
    expect(formatAmount(1.5)).toBe("1 ½");
    expect(formatAmount(2 / 3)).toBe("⅔");
  });

  it("rounds numbers that are almost whole or almost a fraction (from scaling)", () => {
    expect(formatAmount(1.98)).toBe("2");
    expect(formatAmount(0.4999)).toBe("½");
  });

  it("shows large amounts as whole numbers, and other amounts with a comma", () => {
    expect(formatAmount(300)).toBe("300");
    expect(formatAmount(12.4)).toBe("12");
    expect(formatAmount(1.2)).toBe("1,2");
  });
});

describe("formatQuantity", () => {
  it("puts amount and unit together, and handles missing parts", () => {
    expect(formatQuantity(0.5, "pose")).toBe("½ pose");
    expect(formatQuantity(4)).toBe("4");
    expect(formatQuantity(undefined, "ss")).toBe("");
  });

  it("shows a range with a dash, and one number when there's no range", () => {
    expect(formatQuantity(200, "g", 300)).toBe("200–300 g");
    expect(formatQuantity(0.5, "ts", 1)).toBe("½–1 ts");
    expect(formatQuantity(2, undefined, 3)).toBe("2–3");
    expect(formatQuantity(300, "g")).toBe("300 g");
    // Both ends round to the same text: just the one number
    expect(formatQuantity(1, "ss", 1.02)).toBe("1 ss");
  });
});

describe("formatMinutes", () => {
  it("writes minutes, hours, or both", () => {
    expect(formatMinutes(30)).toBe("30 min");
    expect(formatMinutes(60)).toBe("1 t");
    expect(formatMinutes(75)).toBe("1 t 15 min");
  });
});

describe("groupIngredients", () => {
  it("puts ungrouped ingredients first, then each group in the order it appears", () => {
    const groups = groupIngredients([
      { name: "laks" },
      { name: "kesam", group: "Til dippen" },
      { name: "mango" },
      { name: "sennep", group: "Til dippen" },
      { name: "tomat", group: "Salsa" },
    ]);
    expect(
      groups.map((g) => [g.title, g.ingredients.map((i) => i.name)]),
    ).toEqual([
      [undefined, ["laks", "mango"]],
      ["Til dippen", ["kesam", "sennep"]],
      ["Salsa", ["tomat"]],
    ]);
  });

  it("puts the ungrouped ones first even when a group is written above them", () => {
    const groups = groupIngredients([
      { name: "kesam", group: "Dipp" },
      { name: "laks" },
    ]);
    expect(groups.map((g) => g.title)).toEqual([undefined, "Dipp"]);
  });
});

describe("recipeLabels", () => {
  // Only the text of each label; the groups are checked in their own test
  const texts = (recipe: Recipe) =>
    recipeLabels(recipe).map((label) => label.label);
  const base: Recipe = {
    id: "test",
    title: "Test",
    description: "",
    category: "Middag",
    tags: [],
    servings: 2,
    minutes: 45,
    ingredients: [],
    steps: [],
    createdAt: "2026-11-09",
  };

  it("shows the main ingredient, 'Rask' for quick recipes, then the tags", () => {
    expect(
      texts({
        ...base,
        protein: "Fisk",
        minutes: 20,
        tags: ["Glutenfri"],
      }),
    ).toEqual(["Fisk", "Rask", "Glutenfri"]);
  });

  it("shows the cuisine after the main ingredient", () => {
    expect(
      texts({
        ...base,
        protein: "Kylling",
        cuisine: "Italiensk",
        minutes: 20,
      }),
    ).toEqual(["Kylling", "Italiensk", "Rask"]);
  });

  it("doesn't show the difficulty as a label (it's in RecipeMeta)", () => {
    expect(texts({ ...base, difficulty: "Enkel" })).toEqual([]);
  });

  it("shows the themes after the tags", () => {
    expect(
      texts({
        ...base,
        tags: ["Glutenfri"],
        themes: ["Barnevennlig", "Kos"],
      }),
    ).toEqual(["Glutenfri", "Barnevennlig", "Kos"]);
  });

  it("leaves out what doesn't apply", () => {
    expect(texts(base)).toEqual([]);
  });

  it("gives each label its filter group; 'Rask' ticks 'Rask (inntil 30 min)' in Tid", () => {
    expect(
      recipeLabels({
        ...base,
        protein: "Fisk",
        cuisine: "Italiensk",
        minutes: 20,
        tags: ["Glutenfri"],
        themes: ["Kos"],
      }),
    ).toEqual([
      { label: "Fisk", group: "protein" },
      { label: "Italiensk", group: "cuisine" },
      { label: "Rask", group: "time", option: "Rask (inntil 30 min)" },
      { label: "Glutenfri", group: "properties" },
      { label: "Kos", group: "themes" },
    ]);
  });
});

// A recipe with only the required fields: like one posted quickly from the phone.
const titleOnly: Recipe = {
  id: "fiskesuppe",
  title: "Fiskesuppe",
  tags: [],
  ingredients: [],
  steps: [],
  createdAt: "2026-11-10",
};

describe("cardDetails", () => {
  it("writes time and category, and leaves out what's missing", () => {
    expect(cardDetails({ ...titleOnly, minutes: 30, category: "Middag" })).toBe(
      "30 min · Middag",
    );
    expect(cardDetails({ ...titleOnly, category: "Middag" })).toBe("Middag");
    expect(cardDetails({ ...titleOnly, minutes: 75 })).toBe("1 t 15 min");
    expect(cardDetails(titleOnly)).toBe("");
  });
});

describe("isQuick", () => {
  it("is never quick without a time", () => {
    expect(isQuick(titleOnly)).toBe(false);
    expect(isQuick({ ...titleOnly, minutes: 20 })).toBe(true);
  });
});

describe("isIncomplete", () => {
  it("is incomplete until the recipe has ingredients", () => {
    expect(isIncomplete(titleOnly)).toBe(true);
    expect(
      isIncomplete({ ...titleOnly, ingredients: [{ name: "torsk" }] }),
    ).toBe(false);
  });

  it("doesn't need steps to be complete", () => {
    expect(
      isIncomplete({
        ...titleOnly,
        ingredients: [{ name: "torsk" }],
        steps: [],
      }),
    ).toBe(false);
  });
});

describe("recipeSections", () => {
  const base: Recipe = {
    id: "test",
    title: "Test",
    tags: [],
    ingredients: [],
    steps: [],
    createdAt: "2026-11-12",
  };
  const ids = (recipe: Recipe) => recipeSections(recipe).map((s) => s.id);

  it("lists the parts the recipe has, in page order", () => {
    expect(
      ids({
        ...base,
        ingredients: [{ name: "løk" }],
        steps: ["Stek"],
        tips: "Server varm",
      }),
    ).toEqual(["ingredienser", "slik-gjor-du", "tips"]);
  });

  it("leaves out what a half-done recipe doesn't have", () => {
    expect(ids(base)).toEqual([]);
    expect(ids({ ...base, steps: ["Stek"] })).toEqual(["slik-gjor-du"]);
  });

  it("calls the last part 'Kilde' when there's a source but no tips", () => {
    expect(recipeSections({ ...base, source: "Mormor" })).toEqual([
      { id: "tips", label: "Kilde" },
    ]);
  });
});

import { describe, expect, it } from "vitest";
import {
  formatAmount,
  formatMinutes,
  formatQuantity,
  groupIngredients,
  recipeLabels,
} from "./display";
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
    expect(groups.map((g) => [g.title, g.ingredients.map((i) => i.name)])).toEqual([
      [undefined, ["laks", "mango"]],
      ["Til dippen", ["kesam", "sennep"]],
      ["Salsa", ["tomat"]],
    ]);
  });

  it("puts the ungrouped ones first even when a group is written above them", () => {
    const groups = groupIngredients([{ name: "kesam", group: "Dipp" }, { name: "laks" }]);
    expect(groups.map((g) => g.title)).toEqual([undefined, "Dipp"]);
  });
});

describe("recipeLabels", () => {
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
    expect(recipeLabels({ ...base, protein: "Fisk", minutes: 20, tags: ["Glutenfri"] })).toEqual([
      "Fisk",
      "Rask",
      "Glutenfri",
    ]);
  });

  it("leaves out what doesn't apply", () => {
    expect(recipeLabels(base)).toEqual([]);
  });
});

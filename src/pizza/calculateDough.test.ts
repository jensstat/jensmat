import { describe, expect, it } from "vitest";
import type { ResultRow } from "../components/ResultPanel";
import { calculateDough } from "./calculateDough";
import { defaults, pizzaStyles } from "./settings";

// Grams for one ingredient, or undefined if the row isn't there.
const grams = (rows: ResultRow[], label: string) =>
  rows.find((row) => row.label === label)?.grams;

const total = (rows: ResultRow[]) => rows.reduce((sum, row) => sum + row.grams, 0);

describe("calculateDough", () => {
  it("gives back the house recipe with the default settings", () => {
    const rows = calculateDough(defaults);
    // 450 g flour in the recipe; 451 here because 371.5 g per ball is rounded up to 372.
    expect(grams(rows, "Mel")).toBe(451);
    expect(grams(rows, "Vann")).toBe(275);
    expect(grams(rows, "Salt")).toBe(10);
    expect(grams(rows, "Sukker")).toBe(5);
    expect(grams(rows, "Gjær")).toBe(3);
  });

  it("adds up to about pizzas × ball weight, for every pizza type", () => {
    for (const style of Object.values(pizzaStyles)) {
      const settings = { ...defaults, ...style.values };
      const expected = settings.pizzaCount * settings.ballWeight;
      // Each row is rounded on its own, so allow a couple of grams either way.
      expect(Math.abs(total(calculateDough(settings)) - expected)).toBeLessThanOrEqual(2);
    }
  });

  it("returns no rows when a field is empty (NaN)", () => {
    expect(calculateDough({ ...defaults, hydration: NaN })).toEqual([]);
  });

  it("returns no rows for a rise time of 0 (can't divide by zero)", () => {
    expect(calculateDough({ ...defaults, riseHours: 0 })).toEqual([]);
  });

  it("only shows oil when there is oil in the dough", () => {
    expect(grams(calculateDough(defaults), "Olje")).toBeUndefined();
    expect(grams(calculateDough({ ...defaults, oil: 2 }), "Olje")).toBeGreaterThan(0);
  });

  it("needs about 3× more fresh yeast than dry yeast", () => {
    const dry = grams(calculateDough(defaults), "Gjær") ?? 0;
    const fresh = grams(calculateDough({ ...defaults, yeastType: "fersk" }), "Gjær") ?? 0;
    expect(fresh / dry).toBeCloseTo(3.1, 1);
  });

  it("uses less yeast with the forum chart than with the house recipe", () => {
    const house = grams(calculateDough(defaults), "Gjær") ?? 0;
    const forum = grams(calculateDough({ ...defaults, yeastModel: "forum" }), "Gjær") ?? 0;
    expect(forum).toBeLessThan(house);
  });
});

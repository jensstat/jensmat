import { describe, expect, it } from "vitest";
import { occasionsOf } from "./types";
import type { Recipe } from "./types";

// A recipe with just a title, like one posted quickly from the phone
const justTitle: Recipe = {
  id: "test",
  title: "Testrett",
  tags: [],
  ingredients: [],
  steps: [],
  createdAt: "2026-01-01",
};

describe("occasionsOf", () => {
  it("counts a recipe as weekday food when nothing is set", () => {
    expect(occasionsOf(justTitle)).toEqual(["Ukedag"]);
  });

  it("uses what the recipe says when it's set", () => {
    expect(occasionsOf({ ...justTitle, occasions: ["Helgemat"] })).toEqual([
      "Helgemat",
    ]);
    expect(
      occasionsOf({ ...justTitle, occasions: ["Ukedag", "Helgemat"] }),
    ).toEqual(["Ukedag", "Helgemat"]);
  });
});

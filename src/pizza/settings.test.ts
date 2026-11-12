import { describe, expect, it } from "vitest";
import { defaults, isHouseRecipe, pizzaStyles } from "./settings";

describe("isHouseRecipe", () => {
  it("is true for the house recipe", () => {
    expect(isHouseRecipe(defaults)).toBe(true);
    expect(isHouseRecipe({ ...defaults })).toBe(true);
  });

  it("is false after any change, also an empty field", () => {
    expect(isHouseRecipe({ ...defaults, pizzaCount: 4 })).toBe(false);
    expect(isHouseRecipe({ ...defaults, salt: NaN })).toBe(false);
    expect(
      isHouseRecipe({
        ...defaults,
        pizzaStyle: "panne",
        ...pizzaStyles.panne.values,
      }),
    ).toBe(false);
  });
});

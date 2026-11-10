import { describe, expect, it } from "vitest";
import {
  friday,
  isPizzaDay,
  occasionsForDay,
  pickSuggestion,
  saturday,
  sunday,
} from "./suggest";
import type { Recipe } from "./types";

// A made-up recipe with just a title, like in filter.test.ts.
function makeRecipe(fields: Partial<Recipe>): Recipe {
  return {
    id: "test",
    title: "Testrett",
    tags: [],
    ingredients: [],
    steps: [],
    createdAt: "2026-01-01",
    ...fields,
  };
}
// A complete recipe (it has an ingredient, so it's not "Uferdig").
// The other fields (like category) can be given too: complete("a", { category: "Middag" }).
function complete(id: string, fields: Partial<Recipe> = {}): Recipe {
  return makeRecipe({ id, title: id, ingredients: [{ name: "salt" }], ...fields });
}
// A complete dinner. Without occasions it counts as weekday food.
function dinner(id: string, fields: Partial<Recipe> = {}): Recipe {
  return complete(id, { category: "Middag", ...fields });
}

// The lowest and highest "dice rolls" Math.random can give
const lowest = () => 0;
const highest = () => 0.9999;

// A weekday, for the tests where the day doesn't matter
const monday = 1;

describe("isPizzaDay", () => {
  it("is Friday, and only Friday", () => {
    expect(isPizzaDay(friday)).toBe(true);
    for (const day of [0, 1, 2, 3, 4, 6]) {
      expect(isPizzaDay(day)).toBe(false);
    }
  });
});

describe("occasionsForDay", () => {
  it("is weekday food Monday to Friday", () => {
    for (const day of [1, 2, 3, 4, 5]) {
      expect(occasionsForDay(day)).toEqual(["Ukedag"]);
    }
  });

  it("is weekend food on Saturday, and either on Sunday", () => {
    expect(occasionsForDay(saturday)).toEqual(["Helgemat"]);
    expect(occasionsForDay(sunday)).toEqual(["Ukedag", "Helgemat"]);
  });
});

describe("pickSuggestion", () => {
  it("picks by the random number: lowest gives the first, highest the last", () => {
    const recipes = [complete("a"), complete("b"), complete("c")];
    expect(pickSuggestion(recipes, monday, undefined, lowest)?.id).toBe("a");
    expect(pickSuggestion(recipes, monday, undefined, highest)?.id).toBe("c");
  });

  it("works with the real Math.random", () => {
    const recipes = [complete("a"), complete("b")];
    expect(recipes).toContain(pickSuggestion(recipes, monday));
  });

  it("never suggests an incomplete recipe", () => {
    const recipes = [makeRecipe({ id: "uferdig" }), complete("ferdig")];
    expect(pickSuggestion(recipes, monday, undefined, lowest)?.id).toBe("ferdig");
    expect(pickSuggestion(recipes, monday, undefined, highest)?.id).toBe("ferdig");
  });

  it("never suggests the current recipe again", () => {
    const recipes = [complete("a"), complete("b")];
    expect(pickSuggestion(recipes, monday, recipes[0], lowest)?.id).toBe("b");
    expect(pickSuggestion(recipes, monday, recipes[0], highest)?.id).toBe("b");
  });

  it("compares by id, so a new copy of the current recipe counts as the same", () => {
    const recipes = [complete("a"), complete("b")];
    expect(pickSuggestion(recipes, monday, complete("a"), lowest)?.id).toBe("b");
  });

  it("keeps the current recipe when it's the only complete one", () => {
    const only = complete("a");
    expect(
      pickSuggestion([only, makeRecipe({ id: "uferdig" })], monday, only),
    ).toBe(only);
  });

  it("only suggests dinners when there are any", () => {
    const recipes = [
      complete("grot", { category: "Frokost" }),
      dinner("lasagne"),
      complete("mousse", { category: "Dessert" }),
    ];
    expect(pickSuggestion(recipes, monday, undefined, lowest)?.id).toBe("lasagne");
    expect(pickSuggestion(recipes, monday, undefined, highest)?.id).toBe("lasagne");
  });

  it("never suggests an incomplete dinner", () => {
    const recipes = [
      makeRecipe({ id: "fiskesuppe", category: "Middag" }),
      dinner("lasagne"),
    ];
    expect(pickSuggestion(recipes, monday, undefined, lowest)?.id).toBe("lasagne");
  });

  it("suggests any complete recipe when there are no dinners", () => {
    const recipes = [complete("grot", { category: "Frokost" })];
    expect(pickSuggestion(recipes, monday)?.id).toBe("grot");
  });

  it("keeps the only dinner, instead of jumping to a dessert", () => {
    const lasagne = dinner("lasagne");
    const recipes = [lasagne, complete("mousse", { category: "Dessert" })];
    expect(pickSuggestion(recipes, monday, lasagne)).toBe(lasagne);
  });

  it("gives undefined when there are no complete recipes", () => {
    expect(pickSuggestion([], monday)).toBeUndefined();
    expect(
      pickSuggestion([makeRecipe({ title: "Fiskesuppe" })], monday),
    ).toBeUndefined();
  });
});

describe("pickSuggestion and the day", () => {
  // One of each: weekday only (no occasions = "Ukedag"), weekend only, and both
  const taco = dinner("taco");
  const lasagne = dinner("lasagne", { occasions: ["Helgemat"] });
  const wrap = dinner("wrap", { occasions: ["Ukedag", "Helgemat"] });
  const all = [taco, lasagne, wrap];

  // Every recipe the function can give on a day: the lowest and highest dice roll,
  // and one in the middle. With at most 3 to pick from, that's all of them.
  function possible(recipes: Recipe[], day: number) {
    const ids = [0, 0.5, 0.9999].map(
      (roll) => pickSuggestion(recipes, day, undefined, () => roll)?.id,
    );
    return [...new Set(ids)].sort();
  }

  it("suggests weekday food on weekdays: never a dinner that's only weekend food", () => {
    expect(possible(all, monday)).toEqual(["taco", "wrap"]);
  });

  it("suggests weekend food on Saturday, also a dinner marked both", () => {
    expect(possible(all, saturday)).toEqual(["lasagne", "wrap"]);
  });

  it("suggests either on Sunday", () => {
    expect(possible(all, sunday)).toEqual(["lasagne", "taco", "wrap"]);
  });

  it("falls back to any dinner when none suits the day", () => {
    // Saturday, but only weekday food
    expect(possible([taco, complete("mousse", { category: "Dessert" })], saturday))
      .toEqual(["taco"]);
  });

  it("keeps the only fitting dinner, instead of jumping to one for another day", () => {
    expect(pickSuggestion([lasagne, taco], saturday, lasagne)).toBe(lasagne);
  });
});

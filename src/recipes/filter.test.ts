import { describe, expect, it } from "vitest";
import { recipes } from "./data";
import {
  activeFilterCount,
  clearGroup,
  countWithOption,
  filterGroups,
  filterRecipes,
  ingredientNames,
  noFilters,
  tickedOptions,
  toggleOption,
} from "./filter";
import type { Recipe } from "./types";

// A made-up recipe for the tests. Give only the fields the test is about;
// the rest get default values. So the tests don't depend on the real
// recipes in data.ts, which will be replaced (and later come from a CMS).
// The defaults are only the required fields, so makeRecipe({ title: "…" })
// is a recipe with just a title, like one posted quickly from the phone.
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

describe("filterRecipes", () => {
  it("shows every recipe when no filter is chosen", () => {
    expect(filterRecipes(recipes, noFilters)).toEqual(recipes);
  });

  it("shows only the chosen category", () => {
    const dinners = filterRecipes(recipes, {
      ...noFilters,
      chosen: { category: ["Middag"] },
    });
    expect(dinners.length).toBeGreaterThan(0);
    expect(dinners.every((recipe) => recipe.category === "Middag")).toBe(true);
  });

  it("gives an empty list when nothing matches, and leaves the original list untouched", () => {
    const before = recipes.length;
    expect(
      filterRecipes([], { ...noFilters, chosen: { category: ["Middag"] } }),
    ).toEqual([]);
    expect(recipes.length).toBe(before);
  });

  it("shows several categories at once ('or')", () => {
    const lunchOrDinner = filterRecipes(recipes, {
      ...noFilters,
      chosen: { category: ["Lunsj", "Middag"] },
    });
    expect(
      lunchOrDinner.every(
        (recipe) => recipe.category === "Lunsj" || recipe.category === "Middag",
      ),
    ).toBe(true);
    expect(lunchOrDinner.length).toBe(
      recipes.filter(
        (recipe) => recipe.category === "Lunsj" || recipe.category === "Middag",
      ).length,
    );
  });

  it("shows a recipe without a category under 'Alle', but not under a category", () => {
    const noCategory = makeRecipe({ title: "Fiskesuppe" });
    expect(filterRecipes([noCategory], noFilters)).toEqual([noCategory]);
    expect(
      filterRecipes([noCategory], {
        ...noFilters,
        chosen: { category: ["Middag"] },
      }),
    ).toEqual([]);
  });
});

describe("search", () => {
  const wrap = makeRecipe({
    id: "wrap",
    title: "Laksewrap",
    description: "Tandoori-krydret laks i wrap",
    category: "Middag",
    ingredients: [{ name: "laks" }, { name: "Begby pølsesennep" }],
  });
  const lasagne = makeRecipe({
    id: "lasagne",
    title: "Lasagne",
    description: "Klassisk lasagne med kjøttsaus",
    category: "Middag",
    ingredients: [{ name: "kjøttdeig" }, { name: "hakkede tomater" }],
  });
  const mousse = makeRecipe({
    id: "mousse",
    title: "Sjokolademousse",
    category: "Dessert",
    ingredients: [{ name: "mørk sjokolade" }, { name: "egg" }],
  });
  const all = [wrap, lasagne, mousse];

  // A shorthand: search all three recipes for a text, with no category chosen.
  function search(query: string) {
    return filterRecipes(all, { ...noFilters, query });
  }

  it("finds a recipe by its title, whatever the case", () => {
    expect(search("LAKSE")).toEqual([wrap]);
  });

  it("finds a recipe by a word in the description", () => {
    expect(search("kjøttsaus")).toEqual([lasagne]);
  });

  it("finds a recipe by an ingredient, also inside longer names", () => {
    expect(search("tomat")).toEqual([lasagne]);
    expect(search("begby")).toEqual([wrap]);
  });

  it("shows each recipe only once, even if the text is found in several places", () => {
    // "sjokolade" is in both the title and an ingredient
    expect(search("sjokolade")).toEqual([mousse]);
  });

  it("ignores spaces at the ends, but keeps the ones in the middle", () => {
    expect(search("  lasagne  ")).toEqual([lasagne]);
    expect(search("hakkede tomater")).toEqual([lasagne]);
  });

  it("shows everything when the search is empty or only spaces", () => {
    expect(search("")).toEqual(all);
    expect(search("   ")).toEqual(all);
  });

  it("gives an empty list when nothing matches", () => {
    expect(search("taco")).toEqual([]);
  });

  it("combines search and category: both must match", () => {
    const dinnerEgg = filterRecipes(all, {
      ...noFilters,
      chosen: { category: ["Middag"] },
      query: "egg",
    });
    expect(dinnerEgg).toEqual([]); // egg is only in the dessert
    const dinnerLaks = filterRecipes(all, {
      ...noFilters,
      chosen: { category: ["Middag"] },
      query: "laks",
    });
    expect(dinnerLaks).toEqual([wrap]);
  });

  it("finds an incomplete recipe (only a title) by its title", () => {
    const soup = makeRecipe({ id: "soup", title: "Fiskesuppe" });
    expect(
      filterRecipes([soup, wrap], { ...noFilters, query: "suppe" }),
    ).toEqual([soup]);
    // ...and doesn't crash on the missing description when searching for something else
    expect(
      filterRecipes([soup, wrap], { ...noFilters, query: "laks" }),
    ).toEqual([wrap]);
  });
});

describe("ingredientNames", () => {
  it("collects the names from every recipe, each only once", () => {
    const wrap = makeRecipe({
      ingredients: [{ name: "laks" }, { name: "løk" }],
    });
    const lasagne = makeRecipe({
      ingredients: [{ name: "løk" }, { name: "kjøttdeig" }],
    });
    expect(ingredientNames([wrap, lasagne])).toEqual([
      "kjøttdeig",
      "laks",
      "løk",
    ]);
  });

  it("counts different spellings of the same name as one, and leaves the recipe untouched", () => {
    const recipe = makeRecipe({
      ingredients: [{ name: "Løk" }, { name: " løk " }, { name: "løk" }],
    });
    expect(ingredientNames([recipe])).toEqual(["løk"]);
    // Only the list of options is cleaned; the recipe page still shows "Løk"
    expect(recipe.ingredients[0].name).toBe("Løk");
  });

  it("sorts the Norwegian way, with æ, ø and å last", () => {
    const recipe = makeRecipe({
      ingredients: [
        { name: "ål" },
        { name: "ørret" },
        { name: "ærter" },
        { name: "aprikos" },
      ],
    });
    expect(ingredientNames([recipe])).toEqual([
      "aprikos",
      "ærter",
      "ørret",
      "ål",
    ]);
  });

  it("gives an empty list when there are no recipes, or no ingredients yet", () => {
    expect(ingredientNames([])).toEqual([]);
    // An incomplete recipe, posted with just a title
    expect(ingredientNames([makeRecipe({ title: "Fiskesuppe" })])).toEqual([]);
  });
});

describe("main ingredient (proteins)", () => {
  const wrap = makeRecipe({
    id: "wrap",
    category: "Middag",
    protein: "Fisk",
  });
  const lasagne = makeRecipe({
    id: "lasagne",
    category: "Middag",
    protein: "Kjøtt",
  });
  const porridge = makeRecipe({
    id: "porridge",
    category: "Frokost",
    protein: "Vegetar",
  });
  const mousse = makeRecipe({ id: "mousse", category: "Dessert" }); // no main ingredient
  const all = [wrap, lasagne, porridge, mousse];

  it("shows every recipe when nothing is ticked, also those without a main ingredient", () => {
    expect(filterRecipes(all, noFilters)).toEqual(all);
  });

  it("shows only the ticked main ingredient", () => {
    expect(
      filterRecipes(all, { ...noFilters, chosen: { protein: ["Fisk"] } }),
    ).toEqual([wrap]);
  });

  it("shows recipes with any of the ticked main ingredients ('or')", () => {
    expect(
      filterRecipes(all, {
        ...noFilters,
        chosen: { protein: ["Fisk", "Kjøtt"] },
      }),
    ).toEqual([wrap, lasagne]);
  });

  it("hides recipes without a main ingredient once one is ticked", () => {
    expect(
      filterRecipes(all, { ...noFilters, chosen: { protein: ["Vegetar"] } }),
    ).not.toContain(mousse);
  });

  it("combines with the category: both must match ('and')", () => {
    expect(
      filterRecipes(all, {
        ...noFilters,
        chosen: { category: ["Middag"], protein: ["Fisk", "Vegetar"] },
      }),
    ).toEqual([wrap]); // the porridge is Vegetar, but breakfast
  });
});

describe("ingredients", () => {
  const wrap = makeRecipe({
    id: "wrap",
    ingredients: [{ name: "laks" }, { name: "avokado" }],
  });
  const salad = makeRecipe({
    id: "salad",
    ingredients: [{ name: "Avokado" }, { name: "tomat" }],
  });
  const soup = makeRecipe({ id: "soup", title: "Fiskesuppe" }); // no ingredients yet
  const all = [wrap, salad, soup];

  // A shorthand: tick these ingredients, nothing else
  function tick(names: string[]) {
    return filterRecipes(all, { ...noFilters, chosen: { ingredients: names } });
  }

  it("shows recipes with the ticked ingredient, however it's written in the recipe", () => {
    expect(tick(["avokado"])).toEqual([wrap, salad]);
  });

  it("needs ALL the ticked ingredients ('I have these, what can I make?')", () => {
    expect(tick(["laks", "avokado"])).toEqual([wrap]);
    expect(tick(["laks", "tomat"])).toEqual([]);
  });

  it("matches whole names only, unlike the search", () => {
    const fillet = makeRecipe({
      id: "fillet",
      ingredients: [{ name: "laksefilet" }],
    });
    expect(
      filterRecipes([fillet], {
        ...noFilters,
        chosen: { ingredients: ["laks"] },
      }),
    ).toEqual([]);
  });
});

describe("properties", () => {
  const quick = makeRecipe({ id: "quick", minutes: 20 });
  const glutenFree = makeRecipe({
    id: "glutenFree",
    minutes: 90,
    tags: ["Glutenfri"],
  });
  const both = makeRecipe({
    id: "both",
    minutes: 15,
    tags: ["Glutenfri", "Laktosefri"],
  });
  const noTime = makeRecipe({
    id: "noTime",
    tags: ["Glutenfri", "Laktosefri"],
  });
  const all = [quick, glutenFree, both, noTime];

  // A shorthand: tick these properties, nothing else
  function tick(options: string[]) {
    return filterRecipes(all, {
      ...noFilters,
      chosen: { properties: options },
    });
  }

  it("finds a property in the recipe's tags", () => {
    expect(tick(["Glutenfri"])).toEqual([glutenFree, both, noTime]);
  });

  it("needs ALL the ticked properties", () => {
    expect(tick(["Glutenfri", "Laktosefri"])).toEqual([both, noTime]);
    expect(tick(["Laktosefri"])).toEqual([both, noTime]);
  });
});

describe("toggleOption", () => {
  it("ticks an option that isn't ticked, after the ones already ticked", () => {
    const fish = toggleOption(noFilters, "protein", "Fisk");
    expect(fish.chosen).toEqual({ protein: ["Fisk"] });
    expect(toggleOption(fish, "protein", "Kjøtt").chosen).toEqual({
      protein: ["Fisk", "Kjøtt"],
    });
  });

  it("unticks an option that is ticked", () => {
    const before = { ...noFilters, chosen: { protein: ["Fisk", "Kjøtt"] } };
    expect(toggleOption(before, "protein", "Fisk").chosen).toEqual({
      protein: ["Kjøtt"],
    });
  });

  it("leaves the other groups, the other filters and the original untouched", () => {
    const before = {
      ...noFilters,
      query: "laks",
      chosen: { protein: ["Fisk"], properties: ["Glutenfri"] },
    };
    const after = toggleOption(before, "protein", "Kjøtt");
    expect(after.query).toBe("laks");
    expect(after.chosen.properties).toEqual(["Glutenfri"]);
    expect(before.chosen.protein).toEqual(["Fisk"]); // the original wasn't changed
  });
});

describe("counting (the numbers in the panel)", () => {
  const wrap = makeRecipe({
    id: "wrap",
    category: "Middag",
    protein: "Fisk",
    minutes: 20,
    ingredients: [{ name: "laks" }, { name: "avokado" }],
  });
  const lasagne = makeRecipe({
    id: "lasagne",
    category: "Middag",
    protein: "Kjøtt",
    minutes: 90,
    ingredients: [{ name: "kjøttdeig" }, { name: "løk" }],
  });
  const salad = makeRecipe({
    id: "salad",
    category: "Lunsj",
    protein: "Vegetar",
    minutes: 10,
    ingredients: [{ name: "avokado" }, { name: "tomat" }],
  });
  const all = [wrap, lasagne, salad];

  // Looks a group up by its id, so the tests read like the panel
  function group(id: string) {
    const found = filterGroups.find((g) => g.id === id);
    if (!found) throw new Error(`No filter group "${id}"`);
    return found;
  }

  it("counts how many recipes an option would give", () => {
    expect(countWithOption(all, noFilters, group("protein"), "Fisk")).toBe(1);
    expect(countWithOption(all, noFilters, group("protein"), "Kylling")).toBe(
      0,
    );
    expect(
      countWithOption(all, noFilters, group("ingredients"), "avokado"),
    ).toBe(2);
  });

  it("'any' groups: counts the option on its own, not together with the ones ticked", () => {
    const fish = { ...noFilters, chosen: { protein: ["Fisk"] } };
    expect(countWithOption(all, fish, group("protein"), "Kjøtt")).toBe(1);
  });

  it("'all' groups: counts the option together with the ones already ticked", () => {
    const avocado = { ...noFilters, chosen: { ingredients: ["avokado"] } };
    expect(countWithOption(all, avocado, group("ingredients"), "laks")).toBe(1);
    expect(countWithOption(all, avocado, group("ingredients"), "løk")).toBe(0);
    // already ticked: what you see now
    expect(countWithOption(all, avocado, group("ingredients"), "avokado")).toBe(
      2,
    );
  });

  it("respects the other filters: category, search and the other groups", () => {
    const lunch = { ...noFilters, chosen: { category: ["Lunsj"] } };
    expect(countWithOption(all, lunch, group("ingredients"), "avokado")).toBe(
      1,
    );
    const quick = { ...noFilters, chosen: { time: ["20–40 min"] } };
    expect(countWithOption(all, quick, group("protein"), "Kjøtt")).toBe(0);
    expect(countWithOption(all, quick, group("category"), "Middag")).toBe(1);
    expect(countWithOption(all, noFilters, group("category"), "Dessert")).toBe(
      0,
    );
    const withSearch = { ...noFilters, query: "laks" };
    expect(countWithOption(all, withSearch, group("category"), "Middag")).toBe(
      1,
    );
  });

  it("'none' groups: counts the option together with the ones already excluded", () => {
    expect(countWithOption(all, noFilters, group("without"), "avokado")).toBe(
      1,
    );
    const noOnion = { ...noFilters, chosen: { without: ["løk"] } };
    expect(countWithOption(all, noOnion, group("without"), "tomat")).toBe(1);
  });
});

describe("tickedOptions and activeFilterCount", () => {
  it("lists every ticked option with its group, in the panel's order", () => {
    const filters = {
      ...noFilters,
      chosen: { ingredients: ["laks"], protein: ["Fisk", "Kjøtt"] },
    };
    expect(
      tickedOptions(filters).map(
        ({ group, option }) => `${group.id}:${option}`,
      ),
    ).toEqual(["protein:Fisk", "protein:Kjøtt", "ingredients:laks"]);
  });

  it("counts every ticked option, the category too, but not the search", () => {
    expect(activeFilterCount(noFilters)).toBe(0);
    expect(
      activeFilterCount({
        query: "laks",
        chosen: { category: ["Middag"], protein: ["Fisk"], properties: [] },
      }),
    ).toBe(2);
  });
});

describe("time, difficulty and cuisine", () => {
  const quick = makeRecipe({
    id: "quick",
    minutes: 15,
    difficulty: "Superenkel",
    cuisine: "Norsk",
  });
  const medium = makeRecipe({
    id: "medium",
    minutes: 40,
    difficulty: "Enkel",
    cuisine: "Italiensk",
  });
  const slow = makeRecipe({ id: "slow", minutes: 61, difficulty: "Avansert" });
  const notFilledIn = makeRecipe({ id: "notFilledIn", title: "Fiskesuppe" });
  const all = [quick, medium, slow, notFilledIn];

  function tick(groupId: string, options: string[]) {
    return filterRecipes(all, { ...noFilters, chosen: { [groupId]: options } });
  }

  it("puts each recipe in a time range worked out from its minutes", () => {
    expect(tick("time", ["Under 20 min"])).toEqual([quick]);
    expect(tick("time", ["20–40 min"])).toEqual([medium]); // 40 is still "20–40"
    expect(tick("time", ["Over 60 min"])).toEqual([slow]);
    expect(tick("time", ["Under 20 min", "20–40 min"])).toEqual([
      quick,
      medium,
    ]);
  });

  it("filters on difficulty and cuisine ('or' within each)", () => {
    expect(tick("difficulty", ["Superenkel", "Enkel"])).toEqual([
      quick,
      medium,
    ]);
    expect(tick("cuisine", ["Italiensk"])).toEqual([medium]);
  });

  it("hides recipes that don't have the information, but only while that group is in use", () => {
    expect(tick("cuisine", ["Norsk", "Italiensk"])).not.toContain(slow);
    expect(tick("time", ["Under 20 min", "Over 60 min"])).not.toContain(
      notFilledIn,
    );
    expect(filterRecipes(all, noFilters)).toContain(notFilledIn);
  });
});

describe("excluding ingredients ('none')", () => {
  const wrap = makeRecipe({
    id: "wrap",
    ingredients: [{ name: "laks" }, { name: "løk" }],
  });
  const salad = makeRecipe({
    id: "salad",
    ingredients: [{ name: "avokado" }, { name: "Hvitløk" }],
  });
  const soup = makeRecipe({ id: "soup", title: "Fiskesuppe" }); // no ingredients yet
  const all = [wrap, salad, soup];

  function without(names: string[]) {
    return filterRecipes(all, { ...noFilters, chosen: { without: names } });
  }

  it("hides recipes with ANY of the excluded ingredients", () => {
    expect(without(["løk"])).toEqual([salad]); // whole names: "hvitløk" isn't "løk"
    expect(without(["løk", "hvitløk"])).toEqual([]);
  });

  it("hides recipes without ingredients yet, since they might contain anything", () => {
    expect(without(["laks"])).toEqual([salad]);
  });
});

describe("clearGroup", () => {
  it("unticks everything in one group, and leaves the rest", () => {
    const before = {
      ...noFilters,
      chosen: { category: ["Middag", "Lunsj"], protein: ["Fisk"] },
    };
    expect(clearGroup(before, "category").chosen).toEqual({
      category: [],
      protein: ["Fisk"],
    });
  });
});

describe("themes ('Passer til')", () => {
  const porridge = makeRecipe({
    id: "porridge",
    themes: ["Barnevennlig", "Sunn"],
  });
  const lasagne = makeRecipe({
    id: "lasagne",
    themes: ["Kos", "Gjester", "Barnevennlig"],
  });
  const decidedNone = makeRecipe({ id: "decidedNone", themes: [] });
  const notFilledIn = makeRecipe({ id: "notFilledIn" });
  const all = [porridge, lasagne, decidedNone, notFilledIn];

  function tick(options: string[]) {
    return filterRecipes(all, { ...noFilters, chosen: { themes: options } });
  }

  it("shows recipes with the ticked theme", () => {
    expect(tick(["Barnevennlig"])).toEqual([porridge, lasagne]);
    expect(tick(["Gjester"])).toEqual([lasagne]);
  });

  it("needs ALL the ticked themes", () => {
    expect(tick(["Barnevennlig", "Sunn"])).toEqual([porridge]);
    expect(tick(["Sunn", "Kos"])).toEqual([]);
  });

  it("shows every recipe while nothing is ticked, also those not filled in", () => {
    expect(filterRecipes(all, noFilters)).toEqual(all);
  });
});

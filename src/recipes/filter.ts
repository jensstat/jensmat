// Which recipes to show in the overview, based on the chosen filters.
// Only logic, no React, so it can be tested on its own (see filter.test.ts).

import type { Recipe } from "./types";
import {
  categories,
  cuisines,
  difficulties,
  proteins,
  tags,
  themes,
  timeRangeOf,
  timeRanges,
} from "./types";

// All the filters on the overview page, in one object.
// The search has its own field; everything else (the category chips and the
// filter panel) is in `chosen`, one entry per filter group (see filterGroups below).
export interface RecipeFilters {
  query: string; // "" = no search
  // The ticked options, per filter group (by its id):
  // { category: ["Middag"], protein: ["Fisk", "Kjøtt"] }. A group that's missing has nothing ticked.
  chosen: Partial<Record<string, string[]>>;
}
// No filters chosen: every recipe is shown.
export const noFilters: RecipeFilters = {
  query: "",
  chosen: {},
};

// One group of options in the filter panel, like "Hovedingrediens".
// Only what's different from group to group is here; what's the same for all of them
// ("nothing ticked = no filter", "and" between groups) is written once, in filterRecipes.
export interface FilterGroup {
  id: string; // the group's name in the code (later also in the address: ?protein=fisk)
  label: string; // the heading in the panel
  // How the ticked options combine:
  // "any" = or (Kylling or Fisk),
  // "all" = every one of them (laks and avokado: "I have these, what can I make?"),
  // "none" = none of them (a guest who can't have løk or hvitløk).
  combine: "any" | "all" | "none";
  // What you can tick. Gets the recipes, so a group can make its options from them
  // (the ingredients do); a group with a fixed list just ignores them.
  options: (recipes: Recipe[]) => readonly string[];
  // Does this recipe match ONE ticked option?
  matches: (recipe: Recipe, option: string) => boolean;
  // Does the recipe have the information this group filters on? Not every recipe is
  // filled in (see "Incomplete recipes" in docs/03-recipes.md). When something is
  // ticked in this group, a recipe WITHOUT the information is hidden: we can't know
  // if it fits. Leave it out for groups where every recipe has an answer (tags: [] = none).
  hasInfo?: (recipe: Recipe) => boolean;
}

// How an ingredient name is cleaned before names are compared: lower case,
// no spaces at the ends ("Løk " → "løk"). One place, so the options in the panel
// (ingredientNames) and the rule that checks them (the ingredient groups)
// always clean the same way.
export function cleanName(name: string) {
  return name.trim().toLowerCase();
}

// Shared by the two ingredient groups ("Har" and "Uten")
function hasIngredient(recipe: Recipe, option: string) {
  return recipe.ingredients.some(
    (ingredient) => cleanName(ingredient.name) === option,
  );
}
function hasIngredients(recipe: Recipe) {
  return recipe.ingredients.length > 0;
}

// Every filter group, in the order they're shown in the panel
// (ingredients last, since they're the longest lists).
// To add a filter: add one entry here (and a test). If it's a new field on the
// recipe, also add it to the Datasjekk (recipes/completeness.ts).
export const filterGroups: FilterGroup[] = [
  {
    id: "category",
    label: "Måltid",
    combine: "any", // Lunsj or Middag. The category chips above the cards use this group too.
    options: () => categories,
    matches: (recipe, option) => recipe.category === option,
    hasInfo: (recipe) => recipe.category !== undefined,
  },
  {
    id: "protein",
    label: "Hovedingrediens",
    combine: "any",
    options: () => proteins,
    matches: (recipe, option) => recipe.protein === option,
    hasInfo: (recipe) => recipe.protein !== undefined,
  },
  {
    id: "time",
    label: "Tid",
    combine: "any",
    // Worked out from minutes (timeRangeOf in types.ts): nothing extra to fill in
    options: () => timeRanges.map((range) => range.label),
    matches: (recipe, option) => timeRangeOf(recipe) === option,
    hasInfo: (recipe) => recipe.minutes !== undefined,
  },
  {
    id: "difficulty",
    label: "Vanskelighetsgrad",
    combine: "any",
    options: () => difficulties,
    matches: (recipe, option) => recipe.difficulty === option,
    hasInfo: (recipe) => recipe.difficulty !== undefined,
  },
  {
    id: "cuisine",
    label: "Kjøkken",
    combine: "any",
    options: () => cuisines,
    matches: (recipe, option) => recipe.cuisine === option,
    hasInfo: (recipe) => recipe.cuisine !== undefined,
  },
  {
    id: "themes",
    label: "Passer til",
    combine: "all", // Barnevennlig and Sunn: both. Each tick narrows it down
    options: () => themes,
    matches: (recipe, option) =>
      (recipe.themes ?? []).some((theme) => theme === option),
    // Missing = not filled in yet; [] = filled in, none fit
    hasInfo: (recipe) => recipe.themes !== undefined,
  },
  {
    id: "properties",
    label: "Tilpasninger",
    combine: "all", // Glutenfri and Laktosefri: a guest who can't have either
    options: () => tags,
    // .some with ===, not .includes: tags is a list of Tag, and TypeScript won't
    // let you ask it about any string
    matches: (recipe, option) => recipe.tags.some((tag) => tag === option),
    // no hasInfo: tags is always there, [] means "none of these"
  },
  {
    id: "ingredients",
    label: "Har ingredienser",
    combine: "all",
    // The options come from the recipes themselves (cleaned, see ingredientNames),
    // so a new ingredient shows up in the filter by itself.
    options: (recipes) => ingredientNames(recipes),
    matches: hasIngredient,
    hasInfo: hasIngredients,
  },
  {
    id: "without",
    label: "Uten ingredienser",
    combine: "none",
    options: (recipes) => ingredientNames(recipes),
    matches: hasIngredient,
    // A recipe without ingredients yet might contain anything, so it's hidden
    hasInfo: hasIngredients,
  },
];

// Does the recipe pass this group, with these options ticked?
function passesGroup(recipe: Recipe, group: FilterGroup, ticked: string[]) {
  if (ticked.length === 0) return true; // nothing ticked: no filter
  if (group.hasInfo && !group.hasInfo(recipe)) return false; // can't know: hidden
  const matchesOption = (option: string) => group.matches(recipe, option);
  switch (group.combine) {
    case "any":
      return ticked.some(matchesOption);
    case "all":
      return ticked.every(matchesOption);
    case "none":
      return !ticked.some(matchesOption);
  }
}

// The recipes that match every chosen filter. Gives a new list; the original is untouched.
// Search looks in the title, the description and the ingredient names.
// "And" between groups: every group must be happy with the recipe.
export function filterRecipes(
  recipes: Recipe[],
  filters: RecipeFilters,
): Recipe[] {
  // Cleaned once, before the loop: no spaces at the ends, and lower case,
  // so "  Laks" finds "laks". The field itself still shows what was typed.
  const query = filters.query.trim().toLowerCase();

  return recipes.filter((recipe) => {
    const queryMatches =
      recipe.title.toLowerCase().includes(query) ||
      // ?? "": a recipe without a description is searched as if it were empty text
      (recipe.description ?? "").toLowerCase().includes(query) ||
      recipe.ingredients.some((ingredient) =>
        ingredient.name.toLowerCase().includes(query),
      );
    const groupsMatch = filterGroups.every((group) =>
      passesGroup(recipe, group, filters.chosen[group.id] ?? []),
    );
    return queryMatches && groupsMatch;
  });
}

// Every ingredient name in the recipes, each only once, sorted alphabetically.
// Used for the ingredient filters, so the options come from the recipes themselves
// and there's no list to keep up to date.
// The names are cleaned (lower case, no spaces at the ends) before the duplicates are
// removed, so "Løk" and "løk " count as the same ingredient as "løk".
export function ingredientNames(recipes: Recipe[]): string[] {
  const names = recipes.flatMap((recipe) =>
    recipe.ingredients.map((ingredient) => cleanName(ingredient.name)),
  );
  // A Set keeps each value only once; [...] turns it back into a normal array.
  // localeCompare with "nb": Norwegian alphabetical order, with æ, ø, å last.
  return [...new Set(names)].sort((a, b) => a.localeCompare(b, "nb"));
}

// The filters with one option ticked, or unticked if it already was (a tap in the panel).
// Gives a NEW filters object and leaves the old one untouched, as React state needs:
// every level that changes (filters → chosen → the group's list) is copied.
// [groupId]: a "computed key", the value of groupId ("protein") becomes the key.
export function toggleOption(
  filters: RecipeFilters,
  groupId: string,
  option: string,
): RecipeFilters {
  const ticked = filters.chosen[groupId] ?? [];
  const newTicked = ticked.includes(option)
    ? ticked.filter((other) => other !== option) // untick: everything except this one
    : [...ticked, option]; // tick: the old ones, plus this one at the end
  return { ...filters, chosen: { ...filters.chosen, [groupId]: newTicked } };
}

// The filters with nothing ticked in one group (the "Alle" chip clears "category").
export function clearGroup(
  filters: RecipeFilters,
  groupId: string,
): RecipeFilters {
  return { ...filters, chosen: { ...filters.chosen, [groupId]: [] } };
}

// How many recipes you'd see with this option ticked, for the "(2)" after it in the panel.
// 0 means the option leads nowhere, so the panel greys it out.
// - "any" groups: as if it were the only one ticked in its group. "Kjøtt (1)" while
//   Fisk is ticked, not "Kjøtt (2)" (fish or meat), which would be confusing.
// - "all" and "none" groups: the ones already ticked, plus this one. Each tick narrows it down.
// The other groups and the search all count as they are.
export function countWithOption(
  recipes: Recipe[],
  filters: RecipeFilters,
  group: FilterGroup,
  option: string,
): number {
  const ticked = filters.chosen[group.id] ?? [];
  const newTicked =
    group.combine === "any"
      ? [option] // only this one in its group
      : ticked.includes(option)
        ? ticked // already ticked: what you see now
        : [...ticked, option]; // added to the ones already ticked
  return filterRecipes(recipes, {
    ...filters,
    chosen: { ...filters.chosen, [group.id]: newTicked },
  }).length;
}

// The options used in the most recipes, at most `limit` of them: the short list
// for a long group (the ingredients), before "Vis alle". Counted on all the recipes,
// whatever is ticked, so the list doesn't jump around while you tick.
// Equal counts keep the group's own order (alphabetical for the ingredients).
export function mostUsedOptions(
  recipes: Recipe[],
  group: FilterGroup,
  limit: number,
): string[] {
  return group
    .options(recipes)
    .map((option) => ({
      option,
      uses: recipes.filter((recipe) => group.matches(recipe, option)).length,
    }))
    .sort((a, b) => b.uses - a.uses)
    .slice(0, limit)
    .map(({ option }) => option);
}

// Every ticked option, with its group, in the panel's order.
// Used for the small chips above the cards, and for the number on the "Filter" button.
export function tickedOptions(
  filters: RecipeFilters,
): { group: FilterGroup; option: string }[] {
  return filterGroups.flatMap((group) =>
    (filters.chosen[group.id] ?? []).map((option) => ({ group, option })),
  );
}

// The number on the "Filter" button: every ticked option (the chips' meals too).
// The search isn't counted: it has its own field.
export function activeFilterCount(filters: RecipeFilters): number {
  return tickedOptions(filters).length;
}

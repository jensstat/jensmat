// The order of the recipes on the overview: Nyeste, A–Å or Raskest.
// Only logic, no React, so it can be tested on its own (see sort.test.ts).
// Kept in the address like the filters (?sortering=raskest), so reload, back and a
// shared link keep it. "Nyeste" is the default and isn't written in the address.

import type { Recipe } from "./types";

// The choices, in the order they're shown. `value` is what's in the address
// (only a–z, like the filters' names), `label` what you see.
export const sortOptions = [
  { value: "nyeste", label: "Nyeste" },
  { value: "alfabetisk", label: "A–Å" },
  { value: "raskest", label: "Raskest" },
] as const;
export type SortOrder = (typeof sortOptions)[number]["value"];

export const defaultSort: SortOrder = "nyeste";
export const sortParam = "sortering";

// The order in the address, or the default. An unknown value (an old or hand-typed
// link) is ignored, like unknown filter values. .find gives back an item from the list,
// so TypeScript knows it's a SortOrder (no `as`).
export function sortFromParams(params: URLSearchParams): SortOrder {
  const value = params.get(sortParam);
  return (
    sortOptions.find((option) => option.value === value)?.value ?? defaultSort
  );
}

// The recipes in the chosen order, as a new list (the one passed in isn't changed).
// - nyeste: the newest first (createdAt is "2026-11-12", which sorts correctly as text)
// - alfabetisk: by title, the Norwegian way (æ, ø, å last)
// - raskest: the shortest time first; recipes without a time last (we can't know)
// Recipes that are equal keep their order (JavaScript's sort is stable).
export function sortRecipes(recipes: Recipe[], order: SortOrder): Recipe[] {
  const sorted = [...recipes];
  if (order === "nyeste") {
    sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } else if (order === "alfabetisk") {
    sorted.sort((a, b) => a.title.localeCompare(b.title, "nb"));
  } else {
    sorted.sort((a, b) => (a.minutes ?? Infinity) - (b.minutes ?? Infinity));
  }
  return sorted;
}

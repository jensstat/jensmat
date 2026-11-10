// "Hva med…?": which recipe to suggest on the overview.
// Only logic, no React, so it can be tested on its own (see suggest.test.ts).

import { isIncomplete } from "./types";
import type { Recipe } from "./types";

// A random complete recipe, never the same as `current` (the one shown now).
// - Only complete recipes: you can't cook one without ingredients.
// - Compared by id, not by object: the same recipe from a CMS may be a new object each time.
// - If there's no other recipe to pick, `current` stays.
// - undefined if there are no complete recipes at all: then nothing is shown.
//
// `random` is Math.random unless a test passes its own, so a test can decide the "dice roll".
// (Later, the weekday can come in the same way: the page reads the clock, not this function.)
export function pickSuggestion(
  recipes: Recipe[],
  current?: Recipe,
  random: () => number = Math.random,
): Recipe | undefined {
  const candidates = recipes.filter(
    (recipe) => !isIncomplete(recipe) && recipe.id !== current?.id,
  );
  if (candidates.length === 0) return current;
  // random() is 0 ≤ x < 1, so this is a whole number from 0 to length - 1
  return candidates[Math.floor(random() * candidates.length)];
}

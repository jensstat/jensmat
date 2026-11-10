// "Hva med…?": which recipe to suggest on the overview.
// Only logic, no React, so it can be tested on its own (see suggest.test.ts).

import { isIncomplete, occasionsOf } from "./types";
import type { Occasion, Recipe } from "./types";

// The days, numbered like JavaScript's Date.getDay(): 0 is Sunday, 6 is Saturday.
export const sunday = 0;
export const friday = 5;
export const saturday = 6;

// Friday is pizza day: the page shows a link to the pizza calculator instead of a recipe.
export function isPizzaDay(day: number) {
  return day === friday;
}

// Which kind of dinner suits a day:
// Saturday is weekend food, Sunday is either, the rest of the week is weekday food.
// (Friday counts as a weekday here, but on Fridays the page shows pizza instead: see isPizzaDay.)
export function occasionsForDay(day: number): Occasion[] {
  if (day === saturday) return ["Helgemat"];
  if (day === sunday) return ["Ukedag", "Helgemat"];
  return ["Ukedag"];
}

// A random complete dinner that suits the day, never the same as `current` (the one shown now).
// - Only complete recipes: you can't cook one without ingredients.
// - Dinners that suit the day if there are any; then any dinner; then any complete recipe.
// - Compared by id, not by object: the same recipe from a CMS may be a new object each time.
// - If there's no other recipe to pick, `current` stays.
// - undefined if there are no complete recipes at all: then nothing is shown.
//
// `day` and `random` come in from outside, so this function never reads the clock or rolls
// its own dice. The page passes new Date().getDay() and Math.random (the default);
// a test can pass "Saturday" and a fixed "dice roll".
export function pickSuggestion(
  recipes: Recipe[],
  day: number,
  current?: Recipe,
  random: () => number = Math.random,
): Recipe | undefined {
  const complete = recipes.filter((recipe) => !isIncomplete(recipe));
  const dinners = complete.filter((recipe) => recipe.category === "Middag");
  // A dinner suits the day if it has at least one of the day's occasions.
  // So a dinner with both "Ukedag" and "Helgemat" suits every day.
  const wanted = occasionsForDay(day);
  const dinnersForToday = dinners.filter((recipe) =>
    occasionsOf(recipe).some((occasion) => wanted.includes(occasion)),
  );

  // The groups to pick from, best first. The first group that has any recipes is used,
  // so the suggestion doesn't disappear just because no dinner suits the day yet.
  const groups = [dinnersForToday, dinners, complete];
  const group = groups.find((recipes) => recipes.length > 0) ?? [];

  // Removed *after* choosing the group: if the only fitting dinner is shown now,
  // the button keeps it, instead of jumping to a dinner for another day.
  const candidates = group.filter((recipe) => recipe.id !== current?.id);
  if (candidates.length === 0) return current;
  // random() is 0 ≤ x < 1, so this is a whole number from 0 to length - 1
  return candidates[Math.floor(random() * candidates.length)];
}

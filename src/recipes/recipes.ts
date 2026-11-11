import { recipes as rawRecipes } from "./data";
import { readRecipes } from "./toRecipe";
import type { SkippedRecipe } from "./toRecipe";
import type { Recipe } from "./types";

// The data layer: the only file that knows where the recipes come from.
// Today they're read from data.ts, later fetched from a CMS. Fetching takes time and can
// fail, so the functions already work like a fetch: they return a Promise ("the answer
// comes later"), and the pages wait for it (see src/loaders.ts). When the CMS comes,
// only fetchRecipes below changes.
//
// Every recipe goes through the border (toRecipe), so the recipes in data.ts take the
// same path as recipes from a CMS will. A recipe that can't be read is skipped, named
// in the browser console and listed on the Datasjekk, and never crashes a page.

// ---------------------------------------------------------------------------
// Pretend to be the internet (only while developing, with `npm run dev`)
// ---------------------------------------------------------------------------
// A short wait, so you can see "Laster…" between pages. 0 in the tests and on the real site.
const pretendDelayMs = import.meta.env.MODE === "development" ? 300 : 0;
// Set to true to see the error page ("Kunne ikke hente oppskriftene" + "Prøv igjen").
// Remember to set it back to false!
const pretendToFail = false;

// Thrown when the recipes can't be fetched. The error page (RouteErrorPage) knows
// this one, and says "Kunne ikke hente oppskriftene" instead of "Noe gikk galt".
export class RecipesUnavailableError extends Error {
  constructor() {
    super("Kunne ikke hente oppskriftene");
    this.name = "RecipesUnavailableError";
  }
}

// Waits ms milliseconds. A Promise that's "resolved" (finished) when setTimeout fires.
function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Gets every recipe, through the border. With a CMS, this is where the fetch goes:
//   const response = await fetch("https://…/recipes");
//   if (!response.ok) throw new RecipesUnavailableError();
//   return readRecipes(await response.json());
// async: the function returns a Promise. await: wait here until the Promise is finished.
async function fetchRecipes(): Promise<{
  recipes: Recipe[];
  skipped: SkippedRecipe[];
}> {
  if (pretendDelayMs > 0) await wait(pretendDelayMs);
  if (pretendToFail) throw new RecipesUnavailableError();

  const result = readRecipes(rawRecipes);
  if (result.skipped.length > 0) {
    console.warn(
      "Oppskrifter som ikke kunne leses:",
      result.skipped.map((item) => `${item.name}: ${item.problem}`),
    );
  }
  return result;
}

// ---------------------------------------------------------------------------
// What the pages use
// ---------------------------------------------------------------------------

// All the recipes, newest first.
// localeCompare compares the dates as text; "2026-11-09" sorts correctly because it's year-month-day.
export async function getAllRecipes(): Promise<Recipe[]> {
  const { recipes } = await fetchRecipes();
  return recipes.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// One recipe, or undefined if no recipe has that id.
// (With a CMS, this would ask for just the one recipe.)
export async function getRecipe(id: string): Promise<Recipe | undefined> {
  const { recipes } = await fetchRecipes();
  return recipes.find((recipe) => recipe.id === id);
}

// The recipes that couldn't be read, for the Datasjekk.
export async function getSkippedRecipes(): Promise<SkippedRecipe[]> {
  const { skipped } = await fetchRecipes();
  return skipped;
}

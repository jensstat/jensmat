import { readRecipes } from "./toRecipe";
import type { SkippedRecipe } from "./toRecipe";
import type { Recipe } from "./types";
import { sanity, sanityFresh } from "./sanityClient";
import { hasLoginHint } from "../auth/loginHint";
import { recipesQuery } from "./sanityQuery";

// The data layer: the only file that knows where the recipes come from: Sanity, the CMS
// (the client is in sanityClient.ts, the query in sanityQuery.ts). Fetching takes time
// and can fail, so the functions return a Promise ("the answer comes later"), and the
// pages wait for it (see src/loaders.ts).
//
// Every recipe goes through the border (toRecipe), so nothing outside this folder needs
// to know what Sanity's answer looks like. A recipe that can't be read is skipped, named
// in the browser console and listed on the Datasjekk, and never crashes a page.

// Thrown when the recipes can't be fetched. The error page (RouteErrorPage) knows
// this one, and says "Kunne ikke hente oppskriftene" instead of "Noe gikk galt".
export class RecipesUnavailableError extends Error {
  constructor() {
    super("Kunne ikke hente oppskriftene");
    this.name = "RecipesUnavailableError";
  }
}

// Gets every recipe from Sanity, through the border.
// async: the function returns a Promise. await: wait here until the Promise is finished.
async function fetchRecipes(): Promise<{
  recipes: Recipe[];
  skipped: SkippedRecipe[];
}> {
  // Logged in: straight from Sanity, so what you just saved is there.
  // A visitor: the CDN, which is faster but may be a few seconds behind.
  const client = hasLoginHint() ? sanityFresh : sanity;

  let answer: unknown;
  try {
    answer = await client.fetch(recipesQuery);
  } catch (error) {
    // The real reason, for you in the console. The page only needs to know "couldn't fetch".
    console.error("Kunne ikke hente oppskriftene fra Sanity:", error);
    throw new RecipesUnavailableError();
  }
  // The query always gives a list. Anything else means something is badly wrong.
  if (!Array.isArray(answer)) throw new RecipesUnavailableError();

  const result = readRecipes(answer);
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
// (This fetches them all and picks one. Fine for now; later it could ask Sanity for just the one.)
export async function getRecipe(id: string): Promise<Recipe | undefined> {
  const { recipes } = await fetchRecipes();
  return recipes.find((recipe) => recipe.id === id);
}

// The recipes that couldn't be read, for the Datasjekk.
export async function getSkippedRecipes(): Promise<SkippedRecipe[]> {
  const { skipped } = await fetchRecipes();
  return skipped;
}

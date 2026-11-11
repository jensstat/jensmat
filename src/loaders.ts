import type { LoaderFunctionArgs } from "react-router";
import { getAllRecipes, getRecipe, getSkippedRecipes } from "./recipes/recipes";

// Loaders: what each page needs before it's shown. React Router runs the loader when
// you go to the address, waits for it, and only then shows the page. The page reads
// the answer with useLoaderData(), so it never has to think about "not loaded yet".
// While a loader waits, App shows "Laster…"; if it fails (throws), the error page is shown.
// The routes that use them are in routes.tsx.

// /oppskrifter
export function recipeListLoader() {
  return getAllRecipes();
}

// /oppskrifter/:id. undefined when no recipe has that id: the page shows "Fant ikke oppskriften".
export function recipeLoader({ params }: LoaderFunctionArgs) {
  return params.id ? getRecipe(params.id) : undefined;
}

// /oppskrifter/datasjekk
// Promise.all: start both at once, and wait until both are finished.
export async function dataCheckLoader() {
  const [recipes, skipped] = await Promise.all([
    getAllRecipes(),
    getSkippedRecipes(),
  ]);
  return { recipes, skipped };
}

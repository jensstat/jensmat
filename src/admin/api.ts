// The site's way to talk to its own API (api/ on Vercel): one function per thing it
// can do, so the pages never build addresses or read answers themselves. Every call
// sends your login (adminFetch). A future app could use the same four calls.
//
// When something goes wrong, each throws an Error with a message for the page:
// the API's own («Fant ikke oppskriften»), or «Ikke logget inn» / «Ikke tilgang»
// when the login is missing or has run out (see isLoginProblem).

import { adminFetch } from "../auth/adminFetch";
import { shrinkPhoto } from "./photo";
import type { Changes } from "./recipeChanges";

// Sends a request, and gives back the answer (JSON), or throws with the API's message
async function send(url: string, init: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await adminFetch(url, init);
  } catch (problem) {
    // adminFetch's own «Ikke logget inn» goes on as it is. Anything else is fetch
    // failing to reach the server at all (no internet), with an English message
    if (isLoginProblem(problem)) throw problem;
    throw new Error("Fikk ikke kontakt med serveren. Er du på nett?");
  }
  // The API always answers with JSON, but a server error might not: then {}
  const answer = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof answer === "object" && answer !== null && "error" in answer
        ? String(answer.error)
        : `Noe gikk galt (${response.status})`;
    throw new Error(message);
  }
  return answer;
}

// The address of one recipe in the API: /api/recipes?slug=laksewrap
const recipeUrl = (slug: string) =>
  `/api/recipes?slug=${encodeURIComponent(slug)}`;

// POST /api/recipes: a new, published recipe with only a title. Gives its slug
// (the address it got: "laksewrap", or "laksewrap-2" if that was taken)
export async function createRecipe(title: string): Promise<string> {
  const answer = await send("/api/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return (answer as { slug: string }).slug;
}

// PATCH: changes only the fields in `changes` (null removes a field)
export async function updateRecipe(
  slug: string,
  changes: Changes,
): Promise<void> {
  await send(recipeUrl(slug), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  });
}

// DELETE: the recipe, and its draft in the Studio if there is one
export async function deleteRecipe(slug: string): Promise<void> {
  await send(recipeUrl(slug), { method: "DELETE" });
}

// POST /api/photo: shrinks the photo here in the browser first (photo.ts),
// then makes it the recipe's photo
export async function uploadPhoto(slug: string, file: File): Promise<void> {
  const photo = await shrinkPhoto(file);
  await send(`/api/photo?slug=${encodeURIComponent(slug)}`, {
    method: "POST",
    headers: { "Content-Type": photo.type },
    body: photo,
  });
}

// The API's lock said no, or nobody is logged in in this browser:
// the page can offer «Logg inn igjen» instead of only an error
export function isLoginProblem(problem: unknown): boolean {
  return (
    problem instanceof Error &&
    ["Ikke logget inn", "Ikke tilgang"].includes(problem.message)
  );
}

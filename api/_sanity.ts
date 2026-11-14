import { createClient } from "@sanity/client";
import { existsSync } from "node:fs";

// vercel dev only reads .env, not .env.local, so on your Mac we load the
// secrets ourselves. Online the file doesn't exist (it's never committed),
// and Vercel gives the values from its Environment Variables instead.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

// The server's own Sanity client. It holds the write token, so it may ONLY be
// used from api/, never from src/ (that becomes browser code).
const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
  throw new Error("SANITY_WRITE_TOKEN mangler. Ligger den i .env.local?");
}

export const sanityWrite = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID, // not secret, so the same as the site uses
  dataset: process.env.VITE_SANITY_DATASET,
  apiVersion: "2025-02-19",
  useCdn: false, // always fresh: we're about to write
  token,
});

// The id of the published recipe with this address (the site's id is the
// slug), or null if there's none. Used by every function that changes a recipe.
export function findRecipeId(slug: string): Promise<string | null> {
  return sanityWrite.fetch<string | null>(
    `*[_type == "recipe" && slug.current == $slug && !(_id in path("drafts.**"))][0]._id`,
    { slug },
  );
}

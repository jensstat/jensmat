import { createClient } from "@sanity/client";

// The connection to Sanity, set up once. The values come from .env (see 6.7a).
// Only the data layer (recipes.ts) uses this; the pages never know about Sanity.
export const sanity = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: "2025-02-19", // "behave as on this day", so changes at Sanity can't break the site
  useCdn: true, // fast copies near the visitor; a new recipe may take a few seconds to show
});

// The GROQ query that gets the recipes from Sanity (step 6.6), used by fetchRecipes in
// recipes.ts. Try it by hand in the Studio: localhost:3333 → Vision.
//
// How it reads, piece by piece:
// - *                        every document in the dataset
// - [_type == "recipe" …]    the filter: only recipes, and only those with a slug
//                            (no slug = no address, so the site can't show it)
// - | order(_createdAt desc) newest first
// - { … }                    the projection: which fields to send, and what to call them
//
// The projection gives exactly the shape toRecipe (toRecipe.ts) reads, so toRecipe
// doesn't need to know anything about Sanity:
// - "id": slug.current        Sanity stores the slug as { current: "fiskesuppe" }
// - "image": image.asset->url  the photo is a reference to an asset; -> follows it
// - "imageFocus": image.hotspot{ x, y }  the hotspot's middle, only x and y (see image.ts)
// - "createdAt": _createdAt   Sanity's own time, "2026-11-11T13:20:13Z"
// - title, category …         same name in Sanity and on the site, so just the name
//
// Fields that aren't filled in come back as null. toRecipe treats null as missing.
// Drafts aren't included: a public dataset only gives published documents to the site.
//
// The fields, on their own, so the Studio's Datasjekk (studio/dataCheck.ts) can ask for the
// same shape and run it through the same toRecipe and completeness rules as the site.
export const recipeFields = `
  "id": slug.current,
  title,
  description,
  "image": image.asset->url,
  "imageFocus": image.hotspot{ x, y },
  category,
  protein,
  cuisine,
  difficulty,
  tags,
  themes,
  occasions,
  servings,
  minutes,
  ingredients[]{ amount, unit, name, note, group },
  steps,
  tips,
  source,
  "createdAt": _createdAt
`;

export const recipesQuery = `*[_type == "recipe" && defined(slug.current)] | order(_createdAt desc) {${recipeFields}}`;

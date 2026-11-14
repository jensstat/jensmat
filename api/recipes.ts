import { readChanges } from "./_changes.js";
import { findRecipeId, sanityWrite } from "./_sanity.js";
import { nextFreeSlug, toSlug } from "./_slug.js";
import { isAllowed } from "./_auth.js";
// Every address in use, drafts included (a draft's address is taken too)
const TAKEN_SLUGS = `*[_type == "recipe" && defined(slug.current)].slug.current`;

// POST /api/recipes: creates a new, published recipe from { "title": "…" }
export async function POST(request: Request) {
  // 0. The lock: no password, no entry. Checked before anything else
  if (!isAllowed(request)) {
    return Response.json({ error: "Ikke tilgang" }, { status: 401 });
  }

  // 1. Read the body. If it isn't JSON, the caller made a mistake: 400
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Må være JSON" }, { status: 400 });
  }

  // 2. The title is the only required field, and it must give an address
  const title = readTitle(body);
  if (!title) {
    return Response.json({ error: "Mangler tittel" }, { status: 400 });
  }
  const slug = toSlug(title);
  if (!slug) {
    return Response.json(
      { error: "Tittelen må ha minst én bokstav eller ett tall" },
      { status: 400 },
    );
  }

  // 3. Find a free address ("laksewrap-2" if "laksewrap" is taken)
  const taken = await sanityWrite.fetch<string[]>(
    TAKEN_SLUGS,
    {},
    { perspective: "raw" },
  );
  const freeSlug = nextFreeSlug(slug, taken);

  // 4. Create it. No "drafts." in the id, so it's published at once
  const created = await sanityWrite.create({
    _type: "recipe",
    title,
    slug: { _type: "slug", current: freeSlug },
  });

  // 201 Created: something new was made, and here's where it is
  return Response.json({ id: created._id, slug: freeSlug }, { status: 201 });
}

// The body can be anything (unknown), so check it step by step, like toRecipe
function readTitle(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null || !("title" in body)) {
    return undefined;
  }
  if (typeof body.title !== "string") return undefined;
  return body.title.trim() || undefined;
}

// PATCH /api/recipes?slug=laksewrap, with only the fields to change:
// { "minutes": 40, "tips": null } sets the time and removes the tips
export async function PATCH(request: Request) {
  // 0. The lock, first, as always
  if (!isAllowed(request)) {
    return Response.json({ error: "Ikke tilgang" }, { status: 401 });
  }

  // 1. Which recipe? From the address, like /api/photo
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) {
    return Response.json({ error: "Mangler slug" }, { status: 400 });
  }

  // 2. What should change? The rules are in _changes.ts
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Må være JSON" }, { status: 400 });
  }
  const changes = readChanges(body);
  if ("error" in changes) {
    return Response.json({ error: changes.error }, { status: 400 });
  }

  // 3. Does the recipe exist?
  const id = await findRecipeId(slug);
  if (!id) {
    return Response.json({ error: "Fant ikke oppskriften" }, { status: 404 });
  }

  // 4. Change only what was sent. set and unset only if there's something
  const patch = sanityWrite.patch(id);
  if (Object.keys(changes.set).length > 0) patch.set(changes.set);
  if (changes.unset.length > 0) patch.unset(changes.unset);
  await patch.commit();

  return Response.json({
    slug,
    changed: [...Object.keys(changes.set), ...changes.unset],
  });
}

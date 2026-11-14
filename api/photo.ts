import { isAllowed } from "./_auth.js";
import { findRecipeId, sanityWrite } from "./_sanity.js";

// POST /api/photo?slug=laksewrap, with the photo itself as the body.
// Uploads it to Sanity and makes it the recipe's photo (replacing any old one).
export async function POST(request: Request) {
  if (!(await isAllowed(request))) {
    return Response.json({ error: "Ikke tilgang" }, { status: 401 });
  }

  // 1. Which recipe? From the address: ?slug=…
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) {
    return Response.json({ error: "Mangler slug" }, { status: 400 });
  }

  // 2. Is it a photo? The Content-Type header says what the body is
  const type = request.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) {
    return Response.json({ error: "Må være et bilde" }, { status: 400 });
  }

  // 3. Does the recipe exist?
  const id = await findRecipeId(slug);
  if (!id) {
    return Response.json({ error: "Fant ikke oppskriften" }, { status: 404 });
  }

  // 4. Read the photo: raw bytes, not text or JSON
  const photo = Buffer.from(await request.arrayBuffer());
  if (photo.length === 0) {
    return Response.json({ error: "Bildet er tomt" }, { status: 400 });
  }

  // 5. Upload it as an asset, then point the recipe's photo to it
  const asset = await sanityWrite.assets.upload("image", photo, {
    contentType: type,
    filename: slug,
  });
  await sanityWrite
    .patch(id)
    .set({
      image: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      },
    })
    .commit();
  return Response.json({ slug, image: asset.url });
}

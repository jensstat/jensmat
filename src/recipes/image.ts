// The recipe's photo in the right size, and which part of it to keep in view.
// Only logic, no React (see image.test.ts).
//
// Sanity's image service resizes a photo when it's asked for: add ?w=400 to the address,
// and you get a photo 400 pixels wide. So a card gets a small photo and the recipe page a
// large one, instead of sending a 4 MB phone photo to a small card.
// Photos that aren't from Sanity (a file path, another website) are used as they are.

import type { Recipe } from "./types";

const sanityImages = "https://cdn.sanity.io/images/";

// The widths the browser can choose between (see imageSrcSet).
const widths = [160, 320, 480, 640, 960, 1280, 1920, 2560];

// The photo's address, at most `width` pixels wide. undefined if there's no photo.
export function imageUrl(recipe: Recipe, width: number): string | undefined {
  if (recipe.image === undefined) return undefined;
  if (!recipe.image.startsWith(sanityImages)) return recipe.image;

  const url = new URL(recipe.image);
  url.searchParams.set("w", String(Math.round(width)));
  url.searchParams.set("fit", "max"); // never larger than the original photo
  url.searchParams.set("auto", "format"); // WebP/AVIF (smaller files) when the browser can show them
  return url.toString();
}

// For <img srcSet>: the photo in several widths, "…?w=160… 160w, …?w=320… 320w, …".
// Together with <img sizes> (how wide the photo is shown, in CSS pixels), the browser
// works out how many real pixels it needs (a sharp phone or Retina screen has 2 or 3
// for every CSS pixel), and fetches the smallest photo that's big enough.
// undefined for photos that can't be resized: there's only one size to choose from.
export function imageSrcSet(recipe: Recipe): string | undefined {
  if (!recipe.image?.startsWith(sanityImages)) return undefined;
  return widths
    .map((width) => `${imageUrl(recipe, width)} ${width}w`)
    .join(", ");
}

// For CSS object-position: the important part of the photo (the hotspot you choose in
// the Studio) stays in view when the photo is cut to fit its box. "50% 30%" = halfway
// across, a third down. undefined = the middle, the browser's default.
export function imagePosition(recipe: Recipe): string | undefined {
  if (recipe.imageFocus === undefined) return undefined;
  const { x, y } = recipe.imageFocus;
  return `${Math.round(x * 100)}% ${Math.round(y * 100)}%`;
}

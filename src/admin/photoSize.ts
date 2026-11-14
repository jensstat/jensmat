// How big a photo is sent to the API. A phone photo is often 4000 × 3000 px and 3–8 MB;
// Vercel takes at most about 4.5 MB in a request, and the site never shows a photo wider
// than about 1900 px anyway (recipes/image.ts). So the longest side is shrunk to 2000 px.
export const maxPhotoSide = 2000;

// The new size: the longest side at most `max`, the same shape (proportions), and never
// bigger than the photo already is. Pure, so it can be tested; the drawing is in photo.ts.
export function fitInside(
  width: number,
  height: number,
  max = maxPhotoSide,
): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

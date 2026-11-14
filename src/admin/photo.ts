import { fitInside } from "./photoSize";

// Shrinks a photo in the browser before it's sent (uploadPhoto in api.ts): draw it smaller on a <canvas>
// (a drawing surface in the page that's never shown), and save that as a JPEG.
// createImageBitmap reads the photo, turned the right way up (phones store that separately).
export async function shrinkPhoto(file: File): Promise<Blob> {
  let photo: ImageBitmap;
  try {
    photo = await createImageBitmap(file);
  } catch {
    throw new Error("Kunne ikke lese bildet");
  }
  const size = fitInside(photo.width, photo.height);

  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  canvas.getContext("2d")?.drawImage(photo, 0, 0, size.width, size.height);
  photo.close(); // free the memory: a phone photo takes a lot

  // toBlob is older than Promises, so it calls back instead; wrapped in a Promise here.
  // 0.85: JPEG quality, hard to tell from the original, a few hundred kB
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Kunne ikke lagre bildet")),
      "image/jpeg",
      0.85,
    );
  });
}

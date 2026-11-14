import { useEffect, useState, type MouseEvent } from "react";
import { imageUrl } from "../recipes/image";
import type { Recipe } from "../recipes/types";
import { labelClass } from "./editorStyles";
import type { FocusPoint } from "./recipeChanges";

interface PhotoFieldProps {
  recipe: Recipe;
  onChange: () => void; // tells the editor to count the changes again
}

// The photo: choose a new one («Bytt bilde»), and tap the photo to choose its focus
// point, the part that always stays in view when the photo is cut to fit a card
// (the hotspot in the Studio). Both are read from the form when «Lagre» is pressed:
// the photo (name="photo") and the point (focus-x, focus-y).
function PhotoField({ recipe, onChange }: PhotoFieldProps) {
  // A temporary address for a newly chosen photo, made by the browser, so <img> can show it
  const [preview, setPreview] = useState<string>();
  const [focus, setFocus] = useState<FocusPoint | undefined>(recipe.imageFocus);

  // The temporary address takes memory until it's given back: done when a new photo
  // is chosen (preview changes) and when the editor closes
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // A new photo or a new point changes the count on «Lagre»
  useEffect(onChange, [preview, focus, onChange]);

  // The whole photo, never cut, so a tap on it is a point on the real photo
  const shown = preview ?? imageUrl(recipe, 960);

  // Where the tap was, as a share of the photo's width and height (0–1)
  function chooseFocus(event: MouseEvent<HTMLImageElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const share = (n: number) =>
      Math.round(Math.min(1, Math.max(0, n)) * 1000) / 1000;
    setFocus({
      x: share((event.clientX - box.left) / box.width),
      y: share((event.clientY - box.top) / box.height),
    });
  }

  return (
    <div>
      <label htmlFor="edit-photo" className={labelClass}>
        {recipe.image ? "Bytt bilde" : "Bilde"}
      </label>
      {/* accept="image/*": on a phone, the choice of the camera or the photo library */}
      <input
        id="edit-photo"
        type="file"
        name="photo"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          setPreview(file ? URL.createObjectURL(file) : undefined);
          // A new photo starts with no point (the middle) until you tap it
          setFocus(undefined);
        }}
        className="mt-2 block text-sm file:mr-3 file:border file:border-ink/30 file:bg-white file:px-3 file:py-1"
      />

      {shown && (
        <div className="mt-4">
          <p className="text-sm text-ink/60">
            Trykk på bildet for å velge hva som alltid skal synes når bildet
            kuttes (på kortene og øverst på oppskriften).
            {!focus && " Nå: midten."}
          </p>
          {/* relative: the dot is placed on top of the photo, at the point */}
          <div className="relative mt-2 inline-block max-w-sm">
            {/* Tapping the photo is the point here. Without a mouse or touch, the middle
                is used, and the Studio can still set the point */}
            <img
              src={shown}
              alt={preview ? "Det nye bildet" : recipe.title}
              onClick={chooseFocus}
              className="block max-h-80 w-auto cursor-crosshair"
            />
            {focus && (
              <span
                aria-hidden="true"
                style={{ left: `${focus.x * 100}%`, top: `${focus.y * 100}%` }}
                className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gold/80 shadow"
              />
            )}
          </div>
          {focus && (
            <>
              <input type="hidden" name="focus-x" value={focus.x} />
              <input type="hidden" name="focus-y" value={focus.y} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default PhotoField;

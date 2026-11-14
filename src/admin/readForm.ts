import type { Recipe } from "../recipes/types";
import { recipeChanges, type Changes } from "./recipeChanges";

// What the form says now: the changes (only what's different from the recipe),
// and a newly chosen photo. Read from the fields themselves (FormData), the same
// way when counting (while you type) as when saving. Takes FormData (made from the
// <form> by the editor), so it can be tested without a browser (readForm.test.ts)
export function readForm(
  data: FormData,
  recipe: Recipe,
): { changes: Changes; photo?: File } {
  const read = (name: string) => String(data.get(name) ?? "");
  const readAll = (name: string) => data.getAll(name).map(String);

  // The ingredient lines: one list per part, in the same order, put back together
  const units = readAll("ingredient-unit");
  const names = readAll("ingredient-name");
  const notes = readAll("ingredient-note");
  const groups = readAll("ingredient-group");
  const ingredients = readAll("ingredient-amount").map((amount, index) => ({
    amount,
    unit: units[index] ?? "",
    name: names[index] ?? "",
    note: notes[index] ?? "",
    group: groups[index] ?? "",
  }));

  // The focus point: only there if the photo was tapped (PhotoField)
  const focusX = data.get("focus-x");
  const focusY = data.get("focus-y");
  const imageFocus =
    focusX !== null && focusY !== null
      ? { x: Number(focusX), y: Number(focusY) }
      : undefined;

  const changes = recipeChanges(recipe, {
    title: read("title"),
    description: read("description"),
    tips: read("tips"),
    source: read("source"),
    servings: read("servings"),
    minutes: read("minutes"),
    category: read("category"),
    protein: read("protein"),
    cuisine: read("cuisine"),
    difficulty: read("difficulty"),
    tags: readAll("tags"),
    themes: readAll("themes"),
    occasions: readAll("occasions"),
    steps: readAll("steps"),
    ingredients,
    imageFocus,
  });

  // A chosen photo is a File. No photo chosen: an empty File (size 0)
  const photo = data.get("photo");
  if (!(photo instanceof File && photo.size > 0)) return { changes };

  // A new photo has no focus point yet: send the chosen one even if it's where the
  // old photo's was, or the new photo gets none (the middle)
  if (imageFocus) changes.imageFocus = imageFocus;
  return { changes, photo };
}

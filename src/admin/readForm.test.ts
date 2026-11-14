import { describe, expect, it } from "vitest";
import { makeRecipe } from "../recipes/testRecipe";
import { readForm } from "./readForm";

const recipe = makeRecipe({
  title: "Laksewrap",
  servings: 4,
  ingredients: [{ amount: 300, unit: "g", name: "laks" }],
  steps: ["Stek laksen"],
  imageFocus: { x: 0.5, y: 0.5 },
});

// The form as the editor shows it before anything is touched: every field,
// with the same names as the <input>s, <select>s and <textarea>s
function untouchedForm(): FormData {
  const data = new FormData();
  data.set("title", "Laksewrap");
  for (const name of ["description", "tips", "source", "minutes"]) {
    data.set(name, "");
  }
  data.set("servings", "4");
  for (const name of ["category", "protein", "cuisine", "difficulty"]) {
    data.set(name, "");
  }
  data.append("ingredient-amount", "300");
  data.append("ingredient-unit", "g");
  data.append("ingredient-name", "laks");
  data.append("ingredient-note", "");
  data.append("ingredient-group", "");
  data.append("steps", "Stek laksen");
  data.set("focus-x", "0.5");
  data.set("focus-y", "0.5");
  // No photo chosen: the browser sends an empty file
  data.set("photo", new File([], ""));
  return data;
}

describe("readForm", () => {
  it("finds no changes in an untouched form", () => {
    expect(readForm(untouchedForm(), recipe)).toEqual({ changes: {} });
  });

  it("puts the ingredient lines back together from one list per part", () => {
    const data = untouchedForm();
    data.append("ingredient-amount", "½");
    data.append("ingredient-unit", "");
    data.append("ingredient-name", "løk");
    data.append("ingredient-note", "finhakket");
    data.append("ingredient-group", "");
    expect(readForm(data, recipe).changes.ingredients).toEqual([
      { amount: 300, unit: "g", name: "laks" },
      { amount: 0.5, name: "løk", note: "finhakket" },
    ]);
  });

  it("gives a chosen photo, and sends the focus point along with it", () => {
    const data = untouchedForm();
    const photo = new File(["bytes"], "mat.jpg", { type: "image/jpeg" });
    data.set("photo", photo);
    // The point didn't move, but a new photo needs it anyway
    expect(readForm(data, recipe)).toEqual({
      changes: { imageFocus: { x: 0.5, y: 0.5 } },
      photo,
    });
  });
});

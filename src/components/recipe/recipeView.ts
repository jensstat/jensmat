// The ways the recipe overview can be shown, and remembering the chosen one.
// The list is a real array (as const), and the type is made from it, so a value read
// from outside the code (localStorage) can be checked against it while the site runs.
export const recipeViews = ["large", "standard", "list"] as const;
export type RecipeView = (typeof recipeViews)[number];

const storageKey = "recipeView";

// The view saved in this browser, or "standard".
// localStorage is outside the code, like Sanity: it can hold an old or broken value
// ("grid"), or throw if the browser blocks storage. Neither may break the page.
export function readSavedView(): RecipeView {
  try {
    const saved = localStorage.getItem(storageKey);
    // .find gives back an item from the list, so TypeScript knows it's a RecipeView (no `as`)
    return recipeViews.find((view) => view === saved) ?? "standard";
  } catch {
    return "standard";
  }
}

// Remember the view in this browser. If storage is blocked, it just isn't remembered.
export function saveView(view: RecipeView) {
  try {
    localStorage.setItem(storageKey, view);
  } catch {
    // Not remembered, and that's fine: it's only a preference
  }
}

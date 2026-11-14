// «Mangler» in the editor, and links like ?rediger=cuisine from the Datasjekk,
// jump to a field: scroll to it and put the cursor in it.

// Where each field the Datasjekk checks is in the form (the field names are
// the ones in completeness.ts and on the Recipe type)
const fieldElement: Record<string, string> = {
  image: "edit-photo",
  description: "edit-description",
  category: "edit-category",
  protein: "edit-protein",
  minutes: "edit-minutes",
  servings: "edit-servings",
  difficulty: "edit-difficulty",
  cuisine: "edit-cuisine",
  themes: "edit-themes",
  ingredients: "rediger-ingredienser",
};

// Scrolls to a field (in the middle of the screen) and puts the cursor in it.
// For a group (the checkboxes, the ingredients): the first thing in it that can
// have the cursor (a box, a field, or «+ Legg til ingrediens»)
export function jumpTo(field: string) {
  const element = document.getElementById(fieldElement[field] ?? "");
  if (!element) return;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  element.scrollIntoView({
    block: "center",
    behavior: reduceMotion ? "auto" : "smooth",
  });
  const focusable = element.matches("input, select, textarea, button")
    ? element
    : element.querySelector<HTMLElement>("input, select, textarea, button");
  // preventScroll: we've already scrolled, smoothly
  focusable?.focus({ preventScroll: true });
}

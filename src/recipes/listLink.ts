// "← Alle oppskrifter" on a recipe page goes back to the list you came from, with your
// search and filters (?sok=laks&maltid=Middag), not to a fresh, unfiltered list.
//
// A link can bring a small note to the next page without it showing in the address:
// React Router's link `state`. It's kept in the browser's history, so it survives a
// reload of the recipe page. The cards on the overview put the list's ?… part in it
// (listState), and the recipe page reads it back (listAddress).
// A recipe opened from a shared link or a bookmark has no note: then the plain list.

// The note a card on the overview gives its link: the list's ?… part ("" = no filters)
export function listState(search: string) {
  return { listSearch: search };
}

// Where "← Alle oppskrifter" goes. The note comes from the browser's history, so it's
// checked like data from outside (unknown, see toRecipe): only a string starting with "?"
// is used, so the link can never lead anywhere else than the list.
export function listAddress(state: unknown): string {
  if (
    typeof state === "object" &&
    state !== null &&
    "listSearch" in state &&
    typeof state.listSearch === "string" &&
    state.listSearch.startsWith("?")
  ) {
    return `/oppskrifter${state.listSearch}`;
  }
  return "/oppskrifter";
}

// A draft of «Rediger», kept in this browser while you type, so a crash, an empty
// battery or a closed tab doesn't lose your work. Only the changes are kept (the
// same as «Lagre» would send), not the photo (a file is too big for localStorage).
// Cleared when you save, cancel or delete.

import type { Recipe } from "../recipes/types";
import type { Changes } from "./recipeChanges";

export interface Draft {
  savedAt: string; // when it was written, "2026-11-14T14:32:00.000Z"
  changes: Changes;
}

const key = (recipeId: string) => `utkast:${recipeId}`;

// The draft for this recipe, or undefined. localStorage is outside the code
// (like Sanity), so what's there is checked before it's used
export function readDraft(recipeId: string): Draft | undefined {
  try {
    const raw = localStorage.getItem(key(recipeId));
    if (!raw) return undefined;
    const draft: unknown = JSON.parse(raw);
    if (
      typeof draft === "object" &&
      draft !== null &&
      "savedAt" in draft &&
      typeof draft.savedAt === "string" &&
      "changes" in draft &&
      typeof draft.changes === "object" &&
      draft.changes !== null
    ) {
      return { savedAt: draft.savedAt, changes: draft.changes as Changes };
    }
  } catch {
    // Blocked storage or broken text: no draft
  }
  return undefined;
}

export function saveDraft(recipeId: string, changes: Changes) {
  try {
    const draft: Draft = { savedAt: new Date().toISOString(), changes };
    localStorage.setItem(key(recipeId), JSON.stringify(draft));
  } catch {
    // Not kept, and that's fine: it's only a safety net
  }
}

export function clearDraft(recipeId: string) {
  try {
    localStorage.removeItem(key(recipeId));
  } catch {
    // Nothing to do
  }
}

// The recipe as the draft would make it: the saved recipe with the changes put on
// top (null = removed). Used to fill the form again with what you'd written.
// Pure, so it can be tested
export function withChanges(recipe: Recipe, changes: Changes): Recipe {
  const result: Record<string, unknown> = { ...recipe };
  for (const [field, value] of Object.entries(changes)) {
    if (value === null) delete result[field];
    else result[field] = value;
  }
  // Lists are always there on a Recipe, even when emptied
  result.tags ??= [];
  result.steps ??= [];
  result.ingredients ??= [];
  return result as unknown as Recipe;
}

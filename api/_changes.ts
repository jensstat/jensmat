// The rules for changing a recipe (PATCH): which fields may be changed, and
// what a good value looks like. A pure function, so it's easy to test.

import { randomUUID } from "node:crypto";
import {
  categories,
  cuisines,
  difficulties,
  occasions,
  proteins,
  tags,
  themes,
} from "../src/recipes/types.js";

// Each check gives back the clean value, or undefined if the value is wrong
type Check = (value: unknown) => unknown;

const text: Check = (value) =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;

// Portions and minutes: a whole number above 0, like the Studio's rule
const wholeNumber: Check = (value) =>
  typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : undefined;

// Ingredient amounts: any number above 0 (½ dl is fine)
const positiveNumber: Check = (value) =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;

// One value from a fixed list in types.ts (a dropdown in the Studio)
const oneOf =
  (list: readonly string[]): Check =>
  (value) =>
    typeof value === "string" && list.includes(value) ? value : undefined;

// Several values from a fixed list (checkboxes), each only once
const someOf =
  (list: readonly string[]): Check =>
  (value) =>
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && list.includes(item))
      ? [...new Set(value)]
      : undefined;

// The steps: a list of texts. Empty steps are left out
const stepList: Check = (value) => {
  if (!Array.isArray(value)) return undefined;
  if (!value.every((step) => typeof step === "string")) return undefined;
  return value.map((step) => step.trim()).filter((step) => step !== "");
};

// The ingredients: a list of lines. One bad line refuses the whole list
const ingredientList: Check = (value) => {
  if (!Array.isArray(value)) return undefined;
  const lines = value.map(ingredientLine);
  return lines.includes(undefined) ? undefined : lines;
};

// One line: only the name is required, like in the Studio. Sanity needs
// _type (which kind of object) and a _key (an id for the line in the list)
function ingredientLine(raw: unknown): object | undefined {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return undefined;
  }
  const line: Record<string, unknown> = { ...raw };
  const name = text(line.name);
  if (name === undefined) return undefined;

  const clean: Record<string, unknown> = {
    _type: "ingredient",
    _key: randomUUID().slice(0, 12),
    name,
  };
  // The optional parts: missing is fine, but a wrong value is not
  const optional: [string, Check][] = [
    ["amount", positiveNumber],
    ["unit", text],
    ["note", text],
    ["group", text],
  ];
  for (const [field, check] of optional) {
    if (line[field] === undefined || line[field] === null) continue;
    const value = check(line[field]);
    if (value === undefined) return undefined;
    clean[field] = value;
  }
  return clean;
}

// The fields that may be changed. Everything else (_id, _type, slug …) may not
const editable: Record<string, Check> = {
  title: text,
  description: text,
  servings: wholeNumber,
  minutes: wholeNumber,
  tips: text,
  source: text,
  category: oneOf(categories),
  protein: oneOf(proteins),
  cuisine: oneOf(cuisines),
  difficulty: oneOf(difficulties),
  tags: someOf(tags),
  themes: someOf(themes),
  occasions: someOf(occasions),
  steps: stepList,
  ingredients: ingredientList,
};

// What Sanity should do: fields to set, and fields to remove (null)
export interface Changes {
  set: Record<string, unknown>;
  unset: string[];
}

// Reads a body like { "minutes": 40, "tips": null } into Changes,
// or gives an error message that says what's wrong
export function readChanges(body: unknown): Changes | { error: string } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { error: "Må være et objekt med felt" };
  }

  const changes: Changes = { set: {}, unset: [] };
  for (const [field, value] of Object.entries(body)) {
    // Object.hasOwn, not just editable[field]: every object also "has"
    // built-in names like "constructor", which must not count as fields
    if (!Object.hasOwn(editable, field)) {
      return { error: `Kan ikke endre «${field}»` };
    }
    const check = editable[field];

    if (value === null) {
      if (field === "title") return { error: "Tittelen kan ikke fjernes" };
      changes.unset.push(field);
      continue;
    }

    const clean = check(value);
    if (clean === undefined) return { error: `Ugyldig verdi for «${field}»` };
    changes.set[field] = clean;
  }

  if (Object.keys(changes.set).length === 0 && changes.unset.length === 0) {
    return { error: "Ingen endringer" };
  }
  return changes;
}

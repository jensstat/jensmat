// Reading a pasted ingredient list ("2 dl melk\n3 egg\nLøk, finhakket") into ingredient lines.
// Only logic, no React and no Sanity, so it can be tested on its own (parseIngredients.test.ts)
// and used both in the Studio's «Lim inn liste» and, later, in an own form on the site.
//
// The rule when a line can't be read for sure: the text goes in the name, and no number is
// invented. A slightly wrong name is quick to fix by hand; a wrong amount is easy to miss.

import { cleanName } from "./filter";
import type { Ingredient } from "./types";

// Units that are read as the unit when they come right after the amount.
// Anything else is part of the name: "3 egg" has no unit, the name is "egg".
// Also the suggestions in the unit field in «Rediger» (IngredientsField).
export const units = [
  "g",
  "kg",
  "hg",
  "mg",
  "l",
  "dl",
  "cl",
  "ml",
  "ss",
  "ts",
  "krm",
  "stk",
  "fedd",
  "boks",
  "bokser",
  "pk",
  "pakke",
  "pakker",
  "klype",
  "kopp",
  "kopper",
  "never",
  "skive",
  "skiver",
  "bunt",
  "beger",
];

const fractions: Record<string, number> = {
  "½": 1 / 2,
  "¼": 1 / 4,
  "¾": 3 / 4,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 1 / 8,
};

// One number: "2", "1,5", "1.5", "½", "1 ½", "1½" or "1/2"
const numberPattern = String.raw`\d+\/\d+|\d+(?:[.,]\d+)?(?:\s?[½¼¾⅓⅔⅛])?|[½¼¾⅓⅔⅛]`;

// The amount at the start of a line: one number, or a range of two with a dash
// between ("2-3 fedd", "200 – 300 g"). It must be followed by a space, a letter or
// the end of the line, so a number glued to something else isn't read as an amount.
const amountPattern = new RegExp(
  String.raw`^((?:${numberPattern})(?:\s*[-–]\s*(?:${numberPattern}))?)(?=\s|\p{L}|$)`,
  "u",
);

// Bullets and checkboxes from web pages and notes: "- ", "• ", "* ", "[ ] ", "☐ "
const bulletPattern = /^(?:[-–•*·▪◦]|\[[ xX]?\]|[☐☑▢])\s*/;

// "1,5" → 1.5, "1 ½" → 1.5, "1/2" → 0.5. undefined if it isn't a number above 0.
// Also used by the amount field in «Rediger» (src/admin/ingredientLines.ts).
export function toAmount(text: string): number | undefined {
  let amount: number;
  if (text.includes("/")) {
    const [top, bottom] = text.split("/").map(Number);
    amount = top / bottom;
  } else {
    const fraction = fractions[text.slice(-1)] ?? 0;
    const whole = text
      .replace(/[½¼¾⅓⅔⅛]/, "")
      .trim()
      .replace(",", ".");
    amount = (whole === "" ? 0 : Number(whole)) + fraction;
  }
  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
}

// An amount that may be a range: the amount, and the top of the range if there is one
export interface AmountRange {
  amount: number;
  amountMax?: number;
}

// "300" → { amount: 300 }, "200-300" or "200 – 300" → { amount: 200, amountMax: 300 },
// "½-1" → { amount: 0.5, amountMax: 1 }. "2-2" is just 2.
// undefined if a part can't be read, or the range is backwards ("300-200"):
// better to ask than to guess which number was meant.
// Also used by the amount field in «Rediger» (src/admin/ingredientLines.ts).
export function toAmountRange(text: string): AmountRange | undefined {
  const parts = text.split(/\s*[-–]\s*/);
  if (parts.length > 2) return undefined;
  const amount = toAmount(parts[0].trim());
  if (amount === undefined) return undefined;
  if (parts.length === 1) return { amount };
  const amountMax = toAmount(parts[1].trim());
  if (amountMax === undefined || amountMax < amount) return undefined;
  return amountMax === amount ? { amount } : { amount, amountMax };
}

// "løk, finhakket" → name "løk", note "finhakket". Only the first comma counts,
// so the note can have commas of its own. "(400 g)" in the name moves to the note too.
function splitNameAndNote(text: string): { name: string; note?: string } {
  const comma = text.indexOf(",");
  let name = comma === -1 ? text : text.slice(0, comma);
  const notes: string[] = [];
  const brackets = name.match(/\(([^)]*)\)/);
  if (brackets) {
    name = name.replace(brackets[0], " ");
    notes.push(brackets[1]);
  }
  if (comma !== -1) notes.push(text.slice(comma + 1));
  const note = notes
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .join(", ");
  return { name: cleanName(name.replace(/\s+/g, " ")), ...(note && { note }) };
}

// One line → one ingredient, or undefined for an empty line.
// The keys that aren't known are left out (not set to undefined), like in a hand-typed line.
export function parseIngredientLine(line: string): Ingredient | undefined {
  const text = line.replace(bulletPattern, "").trim();
  if (text === "") return undefined;

  let rest = text;
  let range: AmountRange | undefined;
  let unit: string | undefined;

  const amountMatch = rest.match(amountPattern);
  if (amountMatch) {
    range = toAmountRange(amountMatch[1]);
    if (range !== undefined) {
      rest = rest.slice(amountMatch[0].length).trim();
      // The unit: the next word, if it's a known unit ("dl", "stk." → "stk").
      // Also works glued to the amount: "200g smør".
      const unitMatch = rest.match(/^(\p{L}+)\.?(?=\s|,|$)/u);
      if (unitMatch && units.includes(unitMatch[1].toLowerCase())) {
        unit = unitMatch[1].toLowerCase();
        rest = rest.slice(unitMatch[0].length).trim();
      }
    }
  }

  const { name, note } = splitNameAndNote(rest);
  // Only an amount and a unit ("2 dl"), no name: keep the whole line as the name,
  // so it shows up and can be fixed, instead of disappearing.
  if (name === "") return { name: cleanName(text) };

  return {
    ...range,
    ...(unit && { unit }),
    name,
    ...(note && { note }),
  };
}

// A whole pasted list → ingredient lines. One ingredient per line; empty lines are skipped.
// A line that ends in ":" ("Til sausen:") is a heading: the group for the lines after it,
// until the next heading.
export function parseIngredientList(text: string): Ingredient[] {
  const ingredients: Ingredient[] = [];
  let group: string | undefined;
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.replace(bulletPattern, "").trim();
    if (trimmed.endsWith(":") && trimmed.length > 1) {
      group = trimmed.slice(0, -1).trim();
      continue;
    }
    const ingredient = parseIngredientLine(trimmed);
    if (ingredient)
      ingredients.push(group ? { ...ingredient, group } : ingredient);
  }
  return ingredients;
}

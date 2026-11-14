// The ingredient lines in «Rediger»: from an Ingredient to the text in the fields,
// and back. Pure, so it can be tested (ingredientLines.test.ts).

import { toAmountRange } from "../recipes/parseIngredients";
import type { Ingredient } from "../recipes/types";

// One line as the fields hold it: everything is text, "" = empty
export interface IngredientValues {
  amount: string;
  unit: string;
  name: string;
  note: string;
  group: string;
}

// Fractions shown as a sign, but only when they're exact. Not formatAmount from
// display.ts: it rounds (0.15 → "0,2"), and a field must show the real amount,
// or saving would change it without you noticing
const exactFractions: [number, string][] = [
  [1 / 8, "⅛"],
  [1 / 4, "¼"],
  [1 / 3, "⅓"],
  [1 / 2, "½"],
  [2 / 3, "⅔"],
  [3 / 4, "¾"],
];

// The amount as text for the field: 0.5 → "½", 1.5 → "1 ½", 0.15 → "0,15", none → ""
export function amountText(amount?: number): string {
  if (amount === undefined) return "";
  const whole = Math.floor(amount);
  const rest = amount - whole;
  const fraction = exactFractions.find(
    ([value]) => Math.abs(rest - value) < 1e-9,
  );
  if (fraction) return whole === 0 ? fraction[1] : `${whole} ${fraction[1]}`;
  return String(amount).replace(".", ",");
}

// The amount field's text, with a range written with a plain dash, the one you'd
// type: { amount: 200, amountMax: 300 } → "200-300"
export function rangeText(amount?: number, amountMax?: number): string {
  if (amount === undefined) return "";
  if (amountMax === undefined) return amountText(amount);
  return `${amountText(amount)}-${amountText(amountMax)}`;
}

// What's wrong with the text in an amount field, as a message for the browser to
// show at «Lagre» (setCustomValidity in IngredientsField), or "" if it's fine.
// Empty is fine: "salt" has no amount
export function amountProblem(text: string): string {
  const trimmed = text.trim();
  if (trimmed === "" || toAmountRange(trimmed)) return "";
  const parts = trimmed.split(/\s*[-–]\s*/);
  if (parts.length === 2 && toAmountRange(`${parts[1]}-${parts[0]}`)) {
    return "Det minste tallet først: «200-300»";
  }
  return "Skriv et tall («2», «1,5», «½») eller to med strek mellom («200-300»)";
}

// An ingredient → the text in its fields
export function toValues(ingredient: Ingredient): IngredientValues {
  return {
    amount: rangeText(ingredient.amount, ingredient.amountMax),
    unit: ingredient.unit ?? "",
    name: ingredient.name,
    note: ingredient.note ?? "",
    group: ingredient.group ?? "",
  };
}

// The fields → an ingredient, read like the pasted lines ("1,5", "½", "1/2", "200-300").
// undefined without a name (the name is the only required part, like in the Studio).
// Empty parts are left out, not set to "" (the same shape as the recipes from Sanity)
export function fromValues(values: IngredientValues): Ingredient | undefined {
  const name = values.name.trim();
  if (name === "") return undefined;
  const range = toAmountRange(values.amount.trim());
  const unit = values.unit.trim();
  const note = values.note.trim();
  const group = values.group.trim();
  return {
    ...range,
    ...(unit && { unit }),
    name,
    ...(note && { note }),
    ...(group && { group }),
  };
}

// The same lines in the same order? Amounts are compared with a tiny margin,
// since ⅓ written and read back can differ in the last decimal
export function sameIngredients(a: Ingredient[], b: Ingredient[]): boolean {
  return (
    a.length === b.length &&
    a.every((line, index) => {
      const other = b[index];
      return (
        sameNumber(line.amount, other.amount) &&
        sameNumber(line.amountMax, other.amountMax) &&
        line.unit === other.unit &&
        line.name === other.name &&
        line.note === other.note &&
        line.group === other.group
      );
    })
  );
}

// Two amounts that are both missing, or equal with the tiny margin
function sameNumber(a?: number, b?: number): boolean {
  return a === undefined || b === undefined ? a === b : Math.abs(a - b) < 1e-9;
}

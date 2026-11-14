// The ingredient lines in «Rediger»: from an Ingredient to the text in the fields,
// and back. Pure, so it can be tested (ingredientLines.test.ts).

import { toAmount } from "../recipes/parseIngredients";
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

// An ingredient → the text in its fields
export function toValues(ingredient: Ingredient): IngredientValues {
  return {
    amount: amountText(ingredient.amount),
    unit: ingredient.unit ?? "",
    name: ingredient.name,
    note: ingredient.note ?? "",
    group: ingredient.group ?? "",
  };
}

// The fields → an ingredient, read like the pasted lines (toAmount: "1,5", "½", "1/2").
// undefined without a name (the name is the only required part, like in the Studio).
// Empty parts are left out, not set to "" (the same shape as the recipes from Sanity)
export function fromValues(values: IngredientValues): Ingredient | undefined {
  const name = values.name.trim();
  if (name === "") return undefined;
  const amount = toAmount(values.amount.trim());
  const unit = values.unit.trim();
  const note = values.note.trim();
  const group = values.group.trim();
  return {
    ...(amount !== undefined && { amount }),
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
      const sameAmount =
        line.amount === undefined || other.amount === undefined
          ? line.amount === other.amount
          : Math.abs(line.amount - other.amount) < 1e-9;
      return (
        sameAmount &&
        line.unit === other.unit &&
        line.name === other.name &&
        line.note === other.note &&
        line.group === other.group
      );
    })
  );
}

import type { PizzaSettings } from "./settings";
import { idyPercent, yeastStrength } from "./yeast";

// One line in the result: "Mel 451 g". Shown by ResultPanel.
export interface ResultRow {
  label: string;
  grams: number;
}

// Turns the settings into grams for each ingredient.
// A "pure" function: the same settings always give the same result, and it doesn't touch React.
export function calculateDough(s: PizzaSettings): ResultRow[] {
  // An empty field gives NaN ("Not a Number"), and 0 hours would mean dividing by zero.
  // Then there's nothing sensible to show, so return no rows.
  const numbers = [
    s.pizzaCount,
    s.ballWeight,
    s.hydration,
    s.riseHours,
    s.riseTemp,
    s.salt,
    s.sugar,
    s.oil,
  ];
  if (numbers.some((n) => Number.isNaN(n)) || s.riseHours <= 0) {
    return [];
  }

  // The yeast amount comes from rise time, temperature and the chosen way of calculating (see yeast.ts).
  const yeastPercent =
    idyPercent(s.riseHours, s.riseTemp, s.yeastModel) *
    yeastStrength[s.yeastType];

  const totalDough = s.pizzaCount * s.ballWeight;
  // Everything is a % of the flour: flour × (100 % + all the other %) = total dough.
  const totalPercent =
    100 + s.hydration + s.salt + s.sugar + s.oil + yeastPercent;
  const flour = totalDough / (totalPercent / 100);
  // A small helper: how many grams is this % of the flour?
  const grams = (percent: number) => (flour * percent) / 100;

  const rows = [
    { label: "Mel", grams: Math.round(flour) },
    { label: "Vann", grams: Math.round(grams(s.hydration)) },
    { label: "Salt", grams: Math.round(grams(s.salt)) },
    { label: "Sukker", grams: Math.round(grams(s.sugar)) },
    { label: "Olje", grams: Math.round(grams(s.oil)) },
    // Yeast is a small amount, so keep one decimal (e.g. 2.7 g).
    { label: "Gjær", grams: Math.round(grams(yeastPercent) * 10) / 10 },
  ];

  // Hide ingredients you don't use (oil is 0 by default).
  return rows.filter((row) => row.grams > 0);
}

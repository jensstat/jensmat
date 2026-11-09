// How much yeast a dough needs, based on rise time and temperature.
//
// All amounts here are instant dry yeast (IDY), in % of the flour weight.
// Other yeast types are converted with yeastStrength at the bottom.
//
// The source of the data is TXCraig1's "Baker's yeast quantity prediction model"
// on the Pizza Making Forum (pizzamaking.com, topic 26831), built from many home bakers' results.

// ---------------------------------------------------------------------------
// 1. Reference points: known answers, used to check the calculation.
// ---------------------------------------------------------------------------

export interface YeastReferencePoint {
  hours: number;
  tempC: number;
  idyPercent: number;
  source: string;
}

// Data points quoted from the table in the forum thread (temperatures converted from °F).
export const referencePoints: YeastReferencePoint[] = [
  { hours: 2, tempC: 18.3, idyPercent: 0.8, source: "Forum thread (65 °F)" },
  { hours: 12, tempC: 27.2, idyPercent: 0.025, source: "Forum thread (81 °F)" },
  { hours: 48, tempC: 17.8, idyPercent: 0.02, source: "Forum thread (64 °F)" },
];

// ---------------------------------------------------------------------------
// 2. The table: real data, used first when it covers the settings.
// ---------------------------------------------------------------------------

// The rise times (hours) the table has columns for.
export const tableHours: number[] = [];

// One row per temperature, with an IDY % for each time in tableHours.
// Empty until the data from the forum table is entered.
export const yeastTable: { tempC: number; idyPercent: number[] }[] = [];

// Straight line between two known points: where is y when x is between x0 and x1?
function lerp(x: number, x0: number, x1: number, y0: number, y1: number) {
  if (x1 === x0) return y0;
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

// The two neighbours in a sorted list that x lies between (as indexes).
// Returns null if x is outside the list.
function findNeighbours(values: number[], x: number): [number, number] | null {
  if (values.length === 0 || x < values[0] || x > values[values.length - 1]) {
    return null;
  }
  for (let i = 0; i < values.length - 1; i++) {
    if (x <= values[i + 1]) return [i, i + 1];
  }
  return [values.length - 1, values.length - 1];
}

// Looks the amount up in the table, between the nearest times and temperatures.
// Returns null when the settings are outside the table, so the formula can take over.
export function idyPercentFromTable(hours: number, tempC: number): number | null {
  const timeIdx = findNeighbours(tableHours, hours);
  const tempIdx = findNeighbours(
    yeastTable.map((row) => row.tempC),
    tempC,
  );
  if (!timeIdx || !tempIdx) return null;

  // Yeast amounts change by multiplying (half, a quarter …), not by adding,
  // so the in-between steps are done on logarithms. That gives a smooth curve.
  const logH = Math.log(hours);
  const logHours = tableHours.map(Math.log);

  const logAtTemp = (row: { idyPercent: number[] }) =>
    lerp(
      logH,
      logHours[timeIdx[0]],
      logHours[timeIdx[1]],
      Math.log(row.idyPercent[timeIdx[0]]),
      Math.log(row.idyPercent[timeIdx[1]]),
    );

  const low = yeastTable[tempIdx[0]];
  const high = yeastTable[tempIdx[1]];
  const logIdy = lerp(tempC, low.tempC, high.tempC, logAtTemp(low), logAtTemp(high));
  return Math.exp(logIdy);
}

// ---------------------------------------------------------------------------
// 3. The formula: used when the table doesn't cover the settings (or is empty).
// ---------------------------------------------------------------------------

// Fitted so it goes exactly through the three reference points above:
//   IDY % = 1.417 × hours^-1.187 × 2^(-(°C − 20) / 4.6)
// In words:
// - double the time → a bit less than half the yeast (the yeast multiplies along the way)
// - 4.6 °C warmer → the yeast works twice as fast → half the yeast
// It's fitted to data between about 18 and 27 °C. Fridge temperatures are a guess
// (an extrapolation), so check those in the kitchen.
export function idyPercentFromFormula(hours: number, tempC: number) {
  return 1.417 * hours ** -1.187 * 2 ** (-(tempC - 20) / 4.6);
}

// ---------------------------------------------------------------------------
// 4. What the calculator uses.
// ---------------------------------------------------------------------------

// The forum data: the table when it covers the settings, otherwise the formula.
function forumIdyPercent(hours: number, tempC: number) {
  return idyPercentFromTable(hours, tempC) ?? idyPercentFromFormula(hours, tempC);
}

// The house recipe: 3 g instant yeast to 450 g flour, 3 h at 24 °C.
const houseRecipe = { hours: 3, tempC: 24, idyPercent: (3 / 450) * 100 };

// How much more yeast the house recipe uses than the forum data (about 3.2×).
// Worked out from the numbers, so it updates by itself when the table is filled in.
export const houseFactor =
  houseRecipe.idyPercent / forumIdyPercent(houseRecipe.hours, houseRecipe.tempC);

// "hjemme": the forum data scaled to match the house recipe. Same curve, just more yeast,
//           so the house recipe gives exactly 3 g. Long, cold rises get a lot of yeast this way.
// "forum":  the forum data as it is.
export function idyPercent(hours: number, tempC: number, model: string) {
  const forum = forumIdyPercent(hours, tempC);
  return model === "hjemme" ? forum * houseFactor : forum;
}

// How much of each yeast type you need compared with instant dry yeast.
export const yeastStrength: Record<string, number> = {
  tørr: 1,
  fersk: 3, // fresh yeast is weaker: about 3 × as much as instant dry yeast
  surdeig: 30, // rough guess in grams of starter. Sourdough really needs its own calculation later.
};

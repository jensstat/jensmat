// How much yeast a dough needs, based on rise time and temperature.
//
// Source: TXCraig1's "Baker's yeast quantity prediction model" on the Pizza Making Forum
// (pizzamaking.com, topic 26831, reply #261), built from many home bakers' results.
// The chart itself is saved as Yeast-Chart.jpg in the root of the repo.
//
// All amounts here are instant dry yeast (IDY), in % of the flour weight.
// Other yeast types are converted with yeastStrength at the bottom.

// ---------------------------------------------------------------------------
// 1. The chart
// ---------------------------------------------------------------------------

// The chart's columns: the IDY % for each column.
export const chartYeast = [
  0.003, 0.006, 0.01, 0.016, 0.024, 0.032, 0.04, 0.048, 0.056, 0.064, 0.096,
  0.128, 0.16, 0.192, 0.224, 0.256, 0.32,
];

// An empty cell in the chart (the dough would take longer than the chart goes).
const _ = null;

// The chart's rows, typed in exactly as in the image:
// [temperature in °F, hours until the dough is ready for each column in chartYeast].
// Read it like this: at 75 °F (23.9 °C), 0.032 % IDY gives a dough ready in 12 hours.
export const chartRows: [number, (number | null)[]][] = [
  [35, [_, _, _, _, _, _, _, _, _, _, 167, 136, 115, 101, 90, 82, 70]],
  [36, [_, _, _, _, _, _, _, _, _, _, 149, 121, 103, 90, 80, 73, 62]],
  [37, [_, _, _, _, _, _, _, _, _, _, 133, 108, 92, 80, 72, 65, 55]],
  [38, [_, _, _, _, _, _, _, _, _, 161, 120, 97, 82, 72, 65, 59, 50]],
  [39, [_, _, _, _, _, _, _, _, 159, 145, 108, 87, 74, 65, 58, 53, 45]],
  [40, [_, _, _, _, _, _, _, 161, 144, 130, 97, 79, 67, 59, 52, 48, 40]],
  [41, [_, _, _, _, _, _, 166, 145, 130, 118, 88, 71, 61, 53, 47, 43, 37]],
  [42, [_, _, _, _, _, _, 151, 132, 118, 107, 80, 65, 55, 48, 43, 39, 33]],
  [43, [_, _, _, _, _, 161, 137, 120, 107, 97, 72, 59, 50, 44, 39, 35, 30]],
  [44, [_, _, _, _, _, 147, 125, 109, 98, 88, 66, 53, 45, 40, 36, 32, 27]],
  [45, [_, _, _, _, 165, 134, 114, 100, 89, 81, 60, 49, 41, 36, 32, 29, 25]],
  [46, [_, _, _, _, 151, 122, 104, 91, 81, 74, 55, 45, 38, 33, 30, 27, 23]],
  [47, [_, _, _, _, 138, 112, 95, 83, 74, 67, 50, 41, 35, 30, 27, 25, 21]],
  [48, [_, _, _, _, 126, 102, 87, 76, 68, 62, 46, 37, 32, 28, 25, 23, 19]],
  [49, [_, _, _, 156, 116, 94, 80, 70, 63, 57, 42, 34, 29, 26, 23, 21, 18]],
  [50, [_, _, _, 143, 107, 86, 74, 64, 58, 52, 39, 32, 27, 23, 21, 19, 16]],
  [51, [_, _, _, 132, 98, 80, 68, 59, 53, 48, 36, 29, 25, 22, 19, 18, 15]],
  [52, [_, _, _, 122, 90, 73, 62, 55, 49, 44, 33, 27, 23, 20, 18, 16, 14]],
  [53, [_, _, 163, 112, 84, 68, 58, 50, 45, 41, 30, 25, 21, 18, 16, 15, 13]],
  [54, [_, _, 150, 104, 77, 63, 53, 47, 42, 38, 28, 23, 19, 17, 15, 14, 12]],
  [55, [_, _, 139, 96, 71, 58, 49, 43, 39, 35, 26, 21, 18, 16, 14, 13, 11]],
  [56, [_, _, 129, 89, 66, 54, 46, 40, 36, 32, 24, 20, 17, 15, 13, 12, 10]],
  [57, [_, 161, 120, 82, 61, 50, 42, 37, 33, 30, 22, 18, 15, 14, 12, 11, 9]],
  [58, [_, 149, 111, 77, 57, 46, 39, 34, 31, 28, 21, 17, 14, 13, 11, 10, 9]],
  [59, [_, 139, 103, 71, 53, 43, 37, 32, 29, 26, 19, 16, 13, 12, 10, 9, 8]],
  [60, [_, 129, 96, 66, 49, 40, 34, 30, 27, 24, 18, 15, 12, 11, 10, 9, 7]],
  [61, [_, 120, 90, 62, 46, 37, 32, 28, 25, 22, 17, 14, 12, 10, 9, 8, 7]],
  [62, [_, 112, 83, 58, 43, 35, 30, 26, 23, 21, 16, 13, 11, 9, 8, 8, 6]],
  [63, [_, 105, 78, 54, 40, 32, 28, 24, 22, 20, 15, 12, 10, 9, 8, 7, 6]],
  [64, [162, 98, 73, 50, 37, 30, 26, 23, 20, 18, 14, 11, 9, 8, 7, 7, 6]],
  [65, [152, 92, 68, 47, 35, 28, 24, 21, 19, 17, 13, 10, 9, 8, 7, 6, 5]],
  [66, [142, 86, 64, 44, 33, 27, 23, 20, 18, 16, 12, 10, 8, 7, 6, 6, 5]],
  [67, [133, 80, 60, 41, 31, 25, 21, 19, 17, 15, 11, 9, 8, 7, 6, 5, 5]],
  [68, [120, 73, 54, 37, 28, 22, 19, 17, 15, 14, 10, 8, 7, 6, 5, 5, 4]],
  [69, [109, 66, 49, 34, 25, 20, 17, 15, 14, 12, 9, 7, 6, 6, 5, 4, 4]],
  [70, [99, 60, 45, 31, 23, 19, 16, 14, 12, 11, 8, 7, 6, 5, 4, 4, 3]],
  [71, [90, 55, 41, 28, 21, 17, 14, 13, 11, 10, 8, 6, 5, 5, 4, 4, 3]],
  [72, [83, 50, 37, 26, 19, 15, 13, 12, 10, 9, 7, 6, 5, 4, 4, 3, 3]],
  [73, [76, 46, 34, 24, 18, 14, 12, 11, 9, 9, 6, 5, 4, 4, 3, 3, 3]],
  [74, [70, 42, 32, 22, 16, 13, 11, 10, 9, 8, 6, 5, 4, 4, 3, 3, 2]],
  [75, [65, 39, 29, 20, 15, 12, 10, 9, 8, 7, 5, 4, 4, 3, 3, 3, 2]],
  [76, [60, 36, 27, 19, 14, 11, 10, 8, 7, 7, 5, 4, 3, 3, 3, 2, 2]],
  [77, [56, 34, 25, 17, 13, 10, 9, 8, 7, 6, 5, 4, 3, 3, 3, 2, 2]],
  [78, [52, 31, 23, 16, 12, 10, 8, 7, 6, 6, 4, 4, 3, 3, 2, 2, 2]],
  [79, [48, 29, 22, 15, 11, 9, 8, 7, 6, 5, 4, 3, 3, 2, 2, 2, 2]],
  [80, [45, 27, 20, 14, 10, 8, 7, 6, 6, 5, 4, 3, 3, 2, 2, 2, 2]],
  [81, [42, 26, 19, 13, 10, 8, 7, 6, 5, 5, 4, 3, 2, 2, 2, 2, 2]],
  [82, [40, 24, 18, 12, 9, 7, 6, 6, 5, 5, 3, 3, 2, 2, 2, 2, 2]],
  [83, [38, 23, 17, 12, 9, 7, 6, 5, 5, 4, 3, 3, 2, 2, 2, 2, 2]],
  [84, [36, 21, 16, 11, 8, 7, 6, 5, 4, 4, 3, 2, 2, 2, 2, 2, 2]],
  [85, [34, 20, 15, 10, 8, 6, 5, 5, 4, 4, 3, 2, 2, 2, 2, 2, 2]],
  [86, [32, 19, 14, 10, 7, 6, 5, 4, 4, 4, 3, 2, 2, 2, 2, 2, 2]],
  [87, [30, 18, 14, 9, 7, 6, 5, 4, 4, 3, 3, 2, 2, 2, 2, 2, 2]],
  [88, [29, 18, 13, 9, 7, 5, 5, 4, 4, 3, 2, 2, 2, 2, 2, 2, 2]],
  [89, [28, 17, 13, 9, 6, 5, 4, 4, 3, 3, 2, 2, 2, 2, 2, 2, 2]],
  [90, [27, 16, 12, 8, 6, 5, 4, 4, 3, 3, 2, 2, 2, 2, 2, 2, 2]],
  [91, [26, 16, 12, 8, 6, 5, 4, 4, 3, 3, 2, 2, 2, 2, 2, 2, 2]],
  [92, [25, 15, 11, 8, 6, 5, 4, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2]],
  [93, [24, 15, 11, 7, 6, 5, 4, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2]],
  [94, [23, 14, 10, 7, 5, 4, 4, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2]],
  [95, [22, 13, 10, 7, 5, 4, 4, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2]],
];

// ---------------------------------------------------------------------------
// 2. Looking up in the chart
// ---------------------------------------------------------------------------

// Straight line between two known points: where is y when x is between x0 and x1?
// (Also works a bit outside the two points: then the line just continues.)
function lerp(x: number, x0: number, x1: number, y0: number, y1: number) {
  if (x1 === x0) return y0;
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

const average = (values: number[]) =>
  values.reduce((sum, v) => sum + v, 0) / values.length;

// For one row of the chart: the yeast % that makes the dough ready in `hours`.
//
// The chart goes from yeast to hours, but we need hours → yeast, so we read the row "backwards".
// Yeast and time change by multiplying (double the yeast ≈ a bit under half the time),
// so the in-between steps are done on logarithms. That gives a smooth curve.
function yeastInRow(hoursRow: (number | null)[], hours: number): number {
  // The row's points, without the empty cells. Hours fall as the yeast rises.
  // Several columns can show the same rounded hours (2, 2, 2 at high temperatures):
  // those are merged into one point in the middle, so the line doesn't stall.
  const points: { logH: number; logYeast: number[] }[] = [];
  hoursRow.forEach((h, i) => {
    if (h === null) return;
    const last = points[points.length - 1];
    if (last && last.logH === Math.log(h)) {
      last.logYeast.push(Math.log(chartYeast[i]));
    } else {
      points.push({ logH: Math.log(h), logYeast: [Math.log(chartYeast[i])] });
    }
  });
  const line = points.map((p) => ({ logH: p.logH, logY: average(p.logYeast) }));

  // Find the two points the time lies between. Outside the row, the nearest
  // two points are used, and the line is continued a little past the chart.
  const x = Math.log(hours);
  let i = 0;
  while (i < line.length - 2 && x < line[i + 1].logH) i++;
  return Math.exp(
    lerp(x, line[i].logH, line[i + 1].logH, line[i].logY, line[i + 1].logY),
  );
}

// IDY % for a rise time and temperature, looked up in the chart.
// The chart has one row per °F, so the temperature lands between two rows;
// the answer is the in-between value of those two.
export function idyPercentFromChart(hours: number, tempC: number) {
  const firstF = chartRows[0][0];
  const lastF = chartRows[chartRows.length - 1][0];
  // °C → °F, kept inside the chart (35–95 °F, about 2–35 °C).
  const f = Math.min(Math.max(tempC * 1.8 + 32, firstF), lastF);

  const low = Math.floor(f);
  const high = Math.ceil(f);
  const logLow = Math.log(yeastInRow(chartRows[low - firstF][1], hours));
  const logHigh = Math.log(yeastInRow(chartRows[high - firstF][1], hours));
  return Math.exp(lerp(f, low, high, logLow, logHigh));
}

// ---------------------------------------------------------------------------
// 3. What the calculator uses
// ---------------------------------------------------------------------------

// The house recipe: 3 g instant yeast to 450 g flour, 3 h at 24 °C.
export const houseRecipe = { hours: 3, tempC: 24, idyPercent: (3 / 450) * 100 };

// How much more yeast the house recipe uses than the chart (about 3.1×).
// Worked out from the numbers, so it follows along if the chart changes.
export const houseFactor =
  houseRecipe.idyPercent /
  idyPercentFromChart(houseRecipe.hours, houseRecipe.tempC);

// "hjemme": the chart scaled to match the house recipe. Same curve, just more yeast,
//           so the house recipe gives exactly 3 g. Long, cold rises get a lot of yeast this way.
// "forum":  the chart as it is.
export function idyPercent(hours: number, tempC: number, model: string) {
  const chart = idyPercentFromChart(hours, tempC);
  return model === "hjemme" ? chart * houseFactor : chart;
}

// How much of each yeast type you need compared with instant dry yeast.
// The factor for fresh yeast comes from the chart's CY row (e.g. 0.032 % IDY = 0.100 % CY).
export const yeastStrength: Record<string, number> = {
  tørr: 1,
  fersk: 3.125,
};

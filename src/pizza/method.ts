// The method: the steps for making the dough, with times and amounts from the settings,
// and clock times counted back from when you want to bake. Only logic, no React,
// so it can be tested on its own (see method.test.ts).

export interface MethodSettings {
  pizzaCount: number;
  ballWeight: number;
  riseHours: number;
  riseTemp: number;
}

export interface Step {
  title: string;
  text: string;
  // How many minutes before baking the step starts. Used for the clock times.
  minutesBeforeBake: number;
}

// \u00a0 in the texts below is a non-breaking space: it keeps a number and its unit
// ("24 °C", "372 g") on the same line.

const mixMinutes = 10; // mixing and the light kneading
const restHours = 0.5; // the rest after oiling ("the dough kneads itself")
const ovenTemp = 250; // the oven's max
const preheatMinutes = 45; // the stone needs at least 30 min; a bit extra to be safe
const fridgeOutMinutes = 90; // cold balls need about 1.5 h at room temperature before baking

// At or below this temperature, the dough is rising in the fridge.
export const fridgeMaxTemp = 10;

// Turns hours into readable Norwegian text: 0.5 → "30 min", 1.5 → "1,5 t", 14.1 → "14 t".
// Short times are rounded to 5 minutes, long ones (3 h or more) to half hours,
// since nobody times a 14-hour rise to the minute.
export function formatHours(hours: number) {
  const minutes = Math.round((hours * 60) / 5) * 5;
  if (minutes < 60) return `${minutes}\u00a0min`;
  const rounded = hours >= 3 ? Math.round(hours * 2) / 2 : minutes / 60;
  // toLocaleString with "nb-NO" writes decimals with a comma, the Norwegian way.
  const h = rounded.toLocaleString("nb-NO", { maximumFractionDigits: 1 });
  return `${h}\u00a0t`;
}

// Builds the steps from the settings, so times and amounts always match the recipe.
// A "pure" function, like calculateDough: the same settings always give the same steps.
export function makeSteps({
  pizzaCount,
  ballWeight,
  riseHours,
  riseTemp,
}: MethodSettings): Step[] {
  // The house method for 3 h: 30 min rest + 1.5 h first rise + 1 h in balls.
  // For other times: subtract the rest, then split what's left 60 % / 40 %.
  // Math.max stops the time going below zero for very short rises.
  const afterRest = Math.max(riseHours - restHours, 0);
  const firstRise = afterRest * 0.6;
  const ballRise = afterRest * 0.4;

  // "Del i 1 … 1 boller" reads oddly, so one pizza gets its own text.
  const onePizza = pizzaCount === 1;
  // A cold rise happens in the fridge, and the balls must warm up before baking.
  const cold = riseTemp <= fridgeMaxTemp;
  const where = cold ? "i kjøleskapet" : `ved ${riseTemp}\u00a0°C`;

  const steps: Step[] = [
    {
      title: "Bland og elt lett",
      text: "Bland alle ingrediensene og elt lett, bare til alt henger sammen.",
      minutesBeforeBake: riseHours * 60 + mixMinutes,
    },
    {
      title: "Olje på ballen",
      text: "Form deigen til en ball og gni den inn med litt olje. Ikke elt mye.",
      minutesBeforeBake: riseHours * 60,
    },
    {
      title: "La den elte seg selv",
      text: `Dekk til og la deigen hvile i ${formatHours(restHours)}.`,
      minutesBeforeBake: riseHours * 60,
    },
    {
      title: "Første heving",
      text: `La deigen heve ${where} i ca. ${formatHours(firstRise)}.`,
      minutesBeforeBake: (firstRise + ballRise) * 60,
    },
    {
      title: onePizza ? "Form bollen" : `Del i ${pizzaCount}`,
      text: onePizza
        ? `Form deigen til én bolle på ca. ${ballWeight}\u00a0g.`
        : `Del deigen i ${pizzaCount} boller à ca. ${ballWeight}\u00a0g.`,
      minutesBeforeBake: ballRise * 60,
    },
    {
      title: "Andre heving",
      text: `La ${onePizza ? "bollen" : "bollene"} heve ${where} til de er luftige, ca. ${formatHours(ballRise)}.`,
      minutesBeforeBake: ballRise * 60,
    },
    // Only for cold rises. The ... spreads in either one step or none.
    ...(cold
      ? [
          {
            title: "Ut av kjøleskapet",
            text: `Ta ${onePizza ? "bollen" : "bollene"} ut av kjøleskapet ca. ${formatHours(fridgeOutMinutes / 60)} før steking, så de får romtemperatur.`,
            minutesBeforeBake: fridgeOutMinutes,
          },
        ]
      : []),
    {
      title: "Varm ovnen",
      text: `Sett ovnen på ${ovenTemp}\u00a0°C med steinen inne. Steinen trenger minst 30\u00a0min.`,
      minutesBeforeBake: preheatMinutes,
    },
    {
      title: "Form og stek",
      text: "Trykk ut pizzaen, legg på fyll og stek på steinen til kanten er gyllen.",
      minutesBeforeBake: 0,
    },
  ];

  // In time order: with a short second rise, the oven has to go on before you divide the dough.
  // sort keeps steps with the same time in the order they're written.
  return steps.sort((a, b) => b.minutesBeforeBake - a.minutesBeforeBake);
}

// Turns "18:00" into a date on the given day at 18:00.
// Returns null if the text isn't a time (for example an empty field).
export function bakeTimeOn(day: Date, time: string): Date | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const date = new Date(day);
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return date;
}

// The clock time a step starts, rounded to 5 minutes: "14:50".
// If it's not on the baking day (long rises), the weekday comes first: "tor. 18:30".
export function stepClock(bakeAt: Date, minutesBeforeBake: number) {
  const rounded = Math.round(minutesBeforeBake / 5) * 5;
  const at = new Date(bakeAt.getTime() - rounded * 60_000);
  const time = `${String(at.getHours()).padStart(2, "0")}:${String(at.getMinutes()).padStart(2, "0")}`;
  if (at.toDateString() === bakeAt.toDateString()) return time;
  const weekday = at.toLocaleDateString("nb-NO", { weekday: "short" });
  return `${weekday} ${time}`;
}

// How long after the baking time «Form og stek» still counts as going on
const bakingMinutes = 30;

// Which step is going on right now (its place in the list), for «Nå» in the method.
// A step goes on from its start until the next one starts; the last one, «Form og stek»,
// until half an hour after the baking time. undefined before the first step has
// started, and after the baking is done. Exact minutes, not the rounded clock times.
export function currentStep(
  steps: Step[],
  bakeAt: Date,
  now: Date,
): number | undefined {
  const minutesLeft = (bakeAt.getTime() - now.getTime()) / 60_000;
  if (minutesLeft < -bakingMinutes) return undefined;
  // The steps are in time order, so the last one that has started is the current one
  let current: number | undefined;
  steps.forEach((step, index) => {
    if (step.minutesBeforeBake >= minutesLeft) current = index;
  });
  return current;
}

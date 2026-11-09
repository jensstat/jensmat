interface InstructionsProps {
  pizzaCount: number;
  ballWeight: number;
  riseHours: number;
  riseTemp: number;
}

interface Step {
  title: string;
  text: string;
}

// \u00a0 in the texts below is a non-breaking space: it keeps a number and its unit
// ("24 °C", "372 g") on the same line.

// The rest after the oiling step ("the dough kneads itself"), in hours.
const restHours = 0.5;

// Turns hours into readable Norwegian text: 0.5 → "30 min", 1.5 → "1,5 t", 14.1 → "14 t".
// Short times are rounded to 5 minutes, long ones (3 h or more) to half hours,
// since nobody times a 14-hour rise to the minute.
function formatHours(hours: number) {
  const minutes = Math.round((hours * 60) / 5) * 5;
  if (minutes < 60) return `${minutes} min`;
  const rounded = hours >= 3 ? Math.round(hours * 2) / 2 : minutes / 60;
  // toLocaleString with "nb-NO" writes decimals with a comma, the Norwegian way.
  const h = rounded.toLocaleString("nb-NO", { maximumFractionDigits: 1 });
  return `${h} t`;
}

// Builds the steps from the settings, so times and amounts always match the recipe.
// A "pure" function, like calculateDough: the same settings always give the same steps.
function makeSteps({
  pizzaCount,
  ballWeight,
  riseHours,
  riseTemp,
}: InstructionsProps): Step[] {
  // The house method for 3 h: 30 min rest + 1.5 h first rise + 1 h in balls.
  // For other times: subtract the rest, then split what's left 60 % / 40 %.
  // Math.max stops the time going below zero for very short rises.
  const afterRest = Math.max(riseHours - restHours, 0);
  const firstRise = afterRest * 0.6;
  const ballRise = afterRest * 0.4;

  // "Del i 1 … 1 boller" reads oddly, so one pizza gets its own text.
  const onePizza = pizzaCount === 1;

  return [
    {
      title: "Bland og elt lett",
      text: "Bland alle ingrediensene og elt lett, bare til alt henger sammen.",
    },
    {
      title: "Olje på ballen",
      text: "Form deigen til en ball og gni den inn med litt olje. Ikke elt mye.",
    },
    {
      title: "La den elte seg selv",
      text: `Dekk til og la deigen hvile i ${formatHours(restHours)}.`,
    },
    {
      title: "Første heving",
      text: `La deigen heve i ca. ${formatHours(firstRise)} ved ${riseTemp} °C.`,
    },
    {
      title: onePizza ? "Form bollen" : `Del i ${pizzaCount}`,
      text: onePizza
        ? `Form deigen til én bolle på ca. ${ballWeight} g.`
        : `Del deigen i ${pizzaCount} boller à ca. ${ballWeight} g.`,
    },
    {
      title: "Andre heving",
      text: `La ${onePizza ? "bollen" : "bollene"} heve til de er luftige, ca. ${formatHours(ballRise)}.`,
    },
    {
      title: "Varm ovnen",
      text: "Sett ovnen på 250 °C med steinen inne minst 30 min før steking.",
    },
    {
      title: "Form og stek",
      text: "Trykk ut pizzaen, legg på fyll og stek til kanten er gyllen.",
    },
  ];
}

// The method as a numbered list, in the same style as the field groups.
function Instructions(props: InstructionsProps) {
  const steps = makeSteps(props);

  return (
    <section>
      <h2 className="mb-4 font-display text-2xl uppercase">Fremgangsmåte</h2>
      {/* <ol> = ordered list: the browser and screen readers know the steps come in order. */}
      <ol className="divide-y divide-neutral-200 border-y border-neutral-200">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4 py-3">
            {/* Fixed width (w-6) that doesn't shrink, so all the texts line up */}
            <span className="w-6 shrink-0 font-display text-2xl leading-none">
              {index + 1}
            </span>
            <span>
              <span className="block font-semibold">{step.title}</span>
              <span className="mt-1 block text-sm text-neutral-600">
                {step.text}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default Instructions;

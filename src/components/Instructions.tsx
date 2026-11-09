import { useState } from "react";
import { bakeTimeOn, makeSteps, stepClock } from "../pizza/method";
import type { MethodSettings } from "../pizza/method";

// The method as a numbered list, in the same style as the field groups.
// The steps themselves are built in pizza/method.ts; this component only shows them.
function Instructions(props: MethodSettings) {
  // When you want to bake. Only this component needs it, so the state lives here
  // and not in the page (unlike the settings, which the result also needs).
  const [bakeTime, setBakeTime] = useState("18:00");

  // Today's date, read once when the component first appears.
  // useState(() => …) runs the function only the first time. Calling new Date() directly
  // during render would give a new answer every render, which React wants to avoid.
  const [today] = useState(() => new Date());

  const steps = makeSteps(props);
  // The baking time as a date today, or null if the field is empty (then no clock times).
  const bakeAt = bakeTimeOn(today, bakeTime);

  return (
    <section>
      <h2 className="font-display text-2xl uppercase">Fremgangsmåte</h2>

      {/* The clock times are counted back from here */}
      <label className="mt-3 mb-4 flex items-center justify-between gap-4 text-sm">
        <span>Stekes kl.</span>
        <input
          type="time"
          value={bakeTime}
          onChange={(event) => setBakeTime(event.target.value)}
          className="border border-black px-2 py-1 font-mono outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
        />
      </label>

      {/* <ol> = ordered list: the browser and screen readers know the steps come in order. */}
      <ol className="divide-y divide-neutral-200 border-y border-neutral-200">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4 py-3">
            {/* Fixed width (w-6) that doesn't shrink, so all the texts line up */}
            <span className="w-6 shrink-0 font-display text-2xl leading-none">
              {index + 1}
            </span>
            <span className="flex-1">
              {/* The title on the left, the clock time on the right */}
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-semibold">{step.title}</span>
                {bakeAt && (
                  <span className="shrink-0 text-sm tabular-nums">
                    {stepClock(bakeAt, step.minutesBeforeBake)}
                  </span>
                )}
              </span>
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

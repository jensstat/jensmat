import { useEffect, useState } from "react";
import { bakeTimeOn, currentStep, makeSteps, stepClock } from "../pizza/method";
import type { MethodSettings, Step } from "../pizza/method";
import KeepScreenOn from "./recipe/KeepScreenOn";

// The method as a numbered list, in the same style as the field groups, with a cooking
// mode like the recipe page's: keep the screen on, tick off steps, and «Nå» on the step
// that's going on right now (from the clock times).
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

      {/* Cooking mode: the phone stays on while your hands are covered in flour */}
      <div className="mb-4">
        <KeepScreenOn look="pizza" />
      </div>

      {/* key: other steps (new settings) start with nothing ticked off */}
      <StepRows
        key={steps.map((step) => step.title + step.minutesBeforeBake).join()}
        steps={steps}
        bakeAt={bakeAt}
      />
      <p className="mt-3 text-xs text-neutral-500 print:hidden">
        Trykk på tallet når et steg er gjort.
      </p>
    </section>
  );
}

// The time now, updated every half minute, so «Nå» moves on by itself while you bake
function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer); // stop when the page closes
  }, []);
  return now;
}

interface StepRowsProps {
  steps: Step[];
  bakeAt: Date | null;
}

// The steps: tap the number to tick one off (✓, grey), like on the recipe page.
// The step going on right now gets «Nå» (currentStep in pizza/method.ts).
function StepRows({ steps, bakeAt }: StepRowsProps) {
  const [done, setDone] = useState<number[]>([]);
  const now = useNow();
  const current = bakeAt ? currentStep(steps, bakeAt, now) : undefined;

  function toggle(index: number) {
    setDone((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  }

  return (
    // <ol> = ordered list: the browser and screen readers know the steps come in order.
    <ol className="divide-y divide-neutral-200 border-y border-neutral-200">
      {steps.map((step, index) => {
        const isDone = done.includes(index);
        const isNow = index === current && !isDone;
        return (
          <li
            key={step.title}
            // aria-current: screen readers say which step is the current one
            aria-current={isNow ? "step" : undefined}
            className={`flex gap-4 py-3 ${isNow ? "-mx-3 bg-neutral-100 px-3" : ""}`}
          >
            {/* The number is a button: tap it when the step is done.
                Fixed width (w-7) that doesn't shrink, so all the texts line up */}
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-pressed={isDone}
              aria-label={`Steg ${index + 1} ferdig`}
              className={`flex h-8 w-7 shrink-0 items-start justify-start font-display text-2xl leading-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-none ${
                isDone ? "text-neutral-400" : ""
              }`}
            >
              {isDone ? "✓" : index + 1}
            </button>
            <span className={`flex-1 ${isDone ? "text-neutral-400" : ""}`}>
              {/* The title on the left, the clock time on the right */}
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-semibold">
                  {step.title}
                  {isNow && (
                    <span className="ml-2 bg-black px-1.5 py-0.5 align-middle text-xs font-normal text-white uppercase">
                      Nå
                    </span>
                  )}
                </span>
                {bakeAt && (
                  <span className="shrink-0 text-sm tabular-nums">
                    {stepClock(bakeAt, step.minutesBeforeBake)}
                  </span>
                )}
              </span>
              <span
                className={`mt-1 block text-sm ${isDone ? "" : "text-neutral-600"}`}
              >
                {step.text}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default Instructions;

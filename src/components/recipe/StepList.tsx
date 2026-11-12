import { useState } from "react";

interface StepListProps {
  steps: string[];
}

// The steps, like Gladkokken: a 50×50 (3.125rem) gold square with the number in serif, a dotted line,
// then the text below in a large, airy size, so you can find your place again while cooking.
//
// Tick off while cooking: the square is a button. Pressed, it shows ✓ and the step turns grey,
// so you can see where you are. Kept only while the page is open (state, not saved):
// the next time you cook it, every step starts fresh.
function StepList({ steps }: StepListProps) {
  // The numbers (0, 1, 2 …) of the steps that are done
  const [done, setDone] = useState<number[]>([]);

  function toggle(index: number) {
    setDone((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  }

  return (
    <ol className="space-y-12">
      {steps.map((step, index) => {
        const isDone = done.includes(index);
        return (
          <li key={index}>
            <div className="flex items-center gap-5">
              {/* aria-pressed: screen readers say "toggle button, pressed / not pressed" */}
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-pressed={isDone}
                aria-label={`Steg ${index + 1} ferdig`}
                className={`flex h-[3.125rem] w-[3.125rem] shrink-0 items-center justify-center font-serif text-[2.125rem] leading-none font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold print:bg-gold print:text-white ${
                  isDone ? "bg-ink/10 text-ink/50" : "bg-gold text-white"
                }`}
              >
                {isDone ? "✓" : index + 1}
              </button>
              <span
                aria-hidden="true"
                className="flex-1 border-t-[3px] border-dotted border-gold/50"
              />
            </div>
            {/* 16/24 on phones, 18/32 on desktop: the same sizes as Gladkokken */}
            <p
              className={`mt-5 text-base leading-6 transition-colors lg:text-lg lg:leading-8 ${
                isDone ? "text-ink/40 print:text-ink" : ""
              }`}
            >
              {step}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

export default StepList;

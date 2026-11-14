import { useState } from "react";
import type { ResultRow } from "../pizza/calculateDough";
import CountStepper from "./CountStepper";

interface ResultPanelProps {
  rows: ResultRow[];
  pizzaCount: number;
  ballWeight: number;
  onPizzaCountChange: (pizzaCount: number) => void;
}

// The result, with the number of pizzas right above the grams: the one setting you
// change most, next to what it changes.
// Phones: a black box, at the top of the page. From lg: a plain list like the fields.
// (Not sticky: the method below would end up hidden behind it while scrolling.)
// The lg: classes "undo" the black box, so both looks share the same markup.
function ResultPanel({
  rows,
  pizzaCount,
  ballWeight,
  onPizzaCountChange,
}: ResultPanelProps) {
  return (
    <aside className="bg-black p-6 text-white lg:bg-transparent lg:p-0 lg:text-black">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl uppercase">Resultat</h2>
        <p className="text-sm text-neutral-400 lg:text-neutral-600">
          à {ballWeight} g
        </p>
      </div>

      <div className="mt-4">
        <CountStepper
          value={pizzaCount}
          onChange={onPizzaCountChange}
          min={1}
          max={20}
          unit="pizzaer"
        />
      </div>

      {/* The calculation returns no rows when a field is empty.
          Then show a message instead of an empty list. */}
      {rows.length === 0 ? (
        <p className="mt-6 text-sm">
          Fyll inn alle feltene for å se resultatet.
        </p>
      ) : (
        // key: new grams (another number of pizzas …) start with nothing ticked off
        <WeighList key={rows.map((row) => row.grams).join()} rows={rows} />
      )}
    </aside>
  );
}

// The grams as a list to tick off while weighing: tap a line when it's in the bowl.
// Only kept while the page is open, like the steps on the recipe page.
function WeighList({ rows }: { rows: ResultRow[] }) {
  const [weighed, setWeighed] = useState<string[]>([]);

  function toggle(label: string) {
    setWeighed((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  }

  return (
    <>
      <ul className="mt-6 flex flex-col gap-1 lg:mt-4 lg:gap-0 lg:divide-y lg:divide-neutral-200 lg:border-y lg:border-neutral-200">
        {rows.map((row) => {
          const done = weighed.includes(row.label);
          return (
            <li key={row.label}>
              {/* aria-pressed: screen readers say "toggle button, pressed / not pressed" */}
              <button
                type="button"
                onClick={() => toggle(row.label)}
                aria-pressed={done}
                className={`flex w-full items-baseline justify-between py-1 text-left transition-opacity focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-none lg:py-3 ${
                  done ? "opacity-40" : ""
                }`}
              >
                <span className={`uppercase ${done ? "line-through" : ""}`}>
                  {done && "✓ "}
                  {row.label}
                </span>
                <span
                  className={`font-display text-4xl lg:text-3xl ${done ? "line-through" : ""}`}
                >
                  {/* toLocaleString("nb-NO"): a Norwegian decimal comma, «4,5 g» */}
                  {row.grams.toLocaleString("nb-NO")} g
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-neutral-400 lg:text-neutral-500 print:hidden">
        Trykk på en linje når den er veid.
      </p>
    </>
  );
}

export default ResultPanel;

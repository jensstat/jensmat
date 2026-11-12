import type { ResultRow } from "../pizza/calculateDough";

interface ResultPanelProps {
  rows: ResultRow[];
  pizzaCount: number;
  ballWeight: number;
}

// Phones: a black box under the settings.
// From lg: a plain list like the fields on the left.
// (Not sticky: the method below would end up hidden behind it while scrolling.)
// The lg: classes "undo" the black box, so both looks share the same markup.
function ResultPanel({ rows, pizzaCount, ballWeight }: ResultPanelProps) {
  return (
    <aside className="bg-black p-6 text-white lg:bg-transparent lg:p-0 lg:text-black">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl uppercase">Resultat</h2>
        <p className="text-sm text-neutral-400 lg:text-neutral-600">
          {pizzaCount} x {ballWeight} g
        </p>
      </div>

      {/* The calculation returns no rows when a field is empty.
          Then show a message instead of an empty list. */}
      {rows.length === 0 ? (
        <p className="mt-6 text-sm">
          Fyll inn alle feltene for å se resultatet.
        </p>
      ) : (
        <dl className="mt-6 flex flex-col gap-3 lg:mt-4 lg:gap-0 lg:divide-y lg:divide-neutral-200 lg:border-y lg:border-neutral-200">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between lg:py-3"
            >
              <dt className="uppercase">{row.label}</dt>
              <dd className="font-display text-4xl lg:text-3xl">
                {row.grams} g
              </dd>
            </div>
          ))}
        </dl>
      )}
    </aside>
  );
}

export default ResultPanel;

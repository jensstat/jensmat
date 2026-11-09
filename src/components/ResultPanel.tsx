// export: the page also uses this type, for its list of rows.
export interface ResultRow {
  label: string;
  grams: number;
}

interface ResultPanelProps {
  rows: ResultRow[];
  pizzaCount: number;
  ballWeight: number;
}

// Phones: a black box under the settings.
// From lg: a plain list like the fields on the left, sticky while you scroll.
// The lg: classes "undo" the black box, so both looks share the same markup.
function ResultPanel({ rows, pizzaCount, ballWeight }: ResultPanelProps) {
  // The total is the sum of all rows, so it can never disagree with them.
  // reduce walks through the list and carries a running sum, starting at 0.
  // Rounded to whole grams: the yeast row can have a decimal, and half a gram doesn't matter for the total.
  const totalGrams = Math.round(rows.reduce((sum, row) => sum + row.grams, 0));

  return (
    // self-start: without it the box stretches to the full height of the
    // grid row, and sticky has nowhere to move.
    <aside className="bg-black p-6 text-white lg:sticky lg:top-28 lg:self-start lg:bg-transparent lg:p-0 lg:text-black">
      <h2 className="font-display text-2xl uppercase">Resultat</h2>
      <p className="mt-1 text-sm text-neutral-400 lg:text-neutral-600">
        {pizzaCount} pizzaer à {ballWeight} g
      </p>

      {/* The calculation returns no rows when a field is empty. */}
      {rows.length === 0 && (
        <p className="mt-6 text-sm">Fyll inn alle feltene for å se resultatet.</p>
      )}

      <dl className="mt-6 flex flex-col gap-3 lg:mt-3 lg:gap-0 lg:divide-y lg:divide-neutral-200 lg:border-y lg:border-neutral-200">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between lg:py-3"
          >
            <dt className="uppercase">{row.label}</dt>
            <dd className="font-display text-4xl lg:text-3xl">{row.grams} g</dd>
          </div>
        ))}
      </dl>

      {/* A thick line above the total, like the sum line on a receipt. */}
      <div className="mt-6 flex items-baseline justify-between border-t border-white/30 pt-4 lg:mt-0 lg:border-t-2 lg:border-black">
        <span className="uppercase">Totalt</span>
        <span className="font-display text-5xl text-red-500 lg:text-red-600">
          {totalGrams} g
        </span>
      </div>
    </aside>
  );
}

export default ResultPanel;

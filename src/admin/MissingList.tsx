import { jumpTo } from "./jumpTo";

interface MissingListProps {
  // What the saved recipe is missing (missingFields in recipes/completeness.ts)
  missing: { label: string; field: string }[];
  // The fields the form has filled in since (before «Lagre»)
  filled: string[];
}

// «Mangler 3 av 9» at the top of the editor: the Datasjekk's list for this recipe.
// Tap one to go to its field. Filled in (but not saved yet): ✓ and crossed out.
function MissingList({ missing, filled }: MissingListProps) {
  if (missing.length === 0) {
    return (
      <p className="mt-6 text-sm text-ink/60">
        ✓ Alt Datasjekken ser etter er fylt ut.
      </p>
    );
  }

  const stillMissing = missing.filter(
    ({ field }) => !filled.includes(field),
  ).length;

  return (
    <div className="mt-6 border-l-4 border-gold bg-panel px-4 py-3">
      <p className="text-sm font-medium">
        Mangler {stillMissing} av {missing.length}
      </p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {missing.map(({ label, field }) => {
          const done = filled.includes(field);
          return (
            <li key={field}>
              <button
                type="button"
                onClick={() => jumpTo(field)}
                className={`border bg-white px-2.5 py-1 text-sm hover:border-ink ${
                  done
                    ? "border-ink/10 text-ink/40 line-through"
                    : "border-ink/30"
                }`}
              >
                {done && "✓ "}
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default MissingList;

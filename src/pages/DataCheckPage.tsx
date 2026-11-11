import { Link } from "react-router";
import { checks, completenessReport } from "../recipes/completeness";
import { getAllRecipes } from "../recipes/recipes";

// The "Datasjekk", at /oppskrifter/datasjekk (not in the menu): what each recipe is missing.
// A recipe without e.g. a cuisine is hidden when you filter on cuisine, so this is the
// list of what to fill in. The rules are in recipes/completeness.ts.
function DataCheckPage() {
  const report = completenessReport(getAllRecipes());
  const withGaps = report.filter((row) => row.missing.length > 0);

  // How many recipes are missing each thing: "Kjøkken: 4"
  const perCheck = checks
    .map((check) => ({
      label: check.label,
      count: withGaps.filter((row) => row.missing.includes(check.label)).length,
    }))
    .filter((row) => row.count > 0);

  return (
    <section className="flex-1 bg-white font-sans text-ink">
      <div className="mx-auto w-full max-w-3xl px-5 py-8 lg:py-12">
        <h1 className="font-serif text-[2rem] leading-tight font-semibold">
          Datasjekk
        </h1>
        <p className="mt-2 text-ink/70">
          {withGaps.length === 0
            ? `Alle ${report.length} oppskriftene er fylt ut.`
            : `${withGaps.length} av ${report.length} oppskrifter mangler noe. En oppskrift som mangler for eksempel kjøkken, vises ikke når du filtrerer på kjøkken.`}
        </p>

        {perCheck.length > 0 && (
          <ul
            className="mt-6 flex flex-wrap gap-2"
            aria-label="Mangler, totalt"
          >
            {perCheck.map(({ label, count }) => (
              <li
                key={label}
                className="rounded-full bg-panel px-3 py-1.5 text-sm"
              >
                {label}: {count}
              </li>
            ))}
          </ul>
        )}

        <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
          {report.map(({ recipe, missing }) => (
            <li key={recipe.id} className="py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <Link
                  to={`/oppskrifter/${recipe.id}`}
                  className="font-serif text-lg font-semibold underline-offset-4 hover:underline"
                >
                  {recipe.title}
                </Link>
                <span className="text-sm text-ink/60">
                  {missing.length === 0
                    ? "✓ Ferdig"
                    : `Mangler ${missing.length}`}
                </span>
              </div>
              {missing.length > 0 && (
                <p className="mt-1 text-sm text-ink/70">
                  {missing.join(" · ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default DataCheckPage;

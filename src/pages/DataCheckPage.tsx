import { Link, useLoaderData } from "react-router";
import {
  checks,
  completenessReport,
  similarIngredientNames,
} from "../recipes/completeness";
import type { dataCheckLoader } from "../loaders";

// The "Datasjekk", at /oppskrifter/datasjekk (not in the menu): what each recipe is missing.
// A recipe without e.g. a cuisine is hidden when you filter on cuisine, so this is the
// list of what to fill in. The rules are in recipes/completeness.ts.
function DataCheckPage() {
  // Fetched by the loader before the page is shown (loaders.ts)
  const { recipes, skipped } = useLoaderData<typeof dataCheckLoader>();
  const report = completenessReport(recipes);
  // "tomat" and "tomater": probably the same ingredient, written two ways
  const similarNames = similarIngredientNames(recipes);
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

        {/* Recipes that couldn't be read at all (no id or title), so they're not on the site */}
        {skipped.length > 0 && (
          <div className="mt-6 rounded-lg border border-red-700/30 bg-red-50 p-4">
            <h2 className="font-semibold text-red-900">
              {skipped.length === 1
                ? "1 oppskrift kunne ikke leses"
                : `${skipped.length} oppskrifter kunne ikke leses`}
            </h2>
            <p className="mt-1 text-sm text-ink/70">
              De vises ikke på siden før dette er rettet.
            </p>
            <ul className="mt-2 text-sm">
              {skipped.map(({ position, name, problem }) => (
                <li key={position}>
                  <span className="font-semibold">{name}</span> {problem}
                </li>
              ))}
            </ul>
          </div>
        )}

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

        {similarNames.length > 0 && (
          <div className="mt-10">
            <h2 className="font-serif text-xl font-semibold">
              Like ingrediensnavn
            </h2>
            <p className="mt-1 text-sm text-ink/70">
              Er dette det samme? Skriv dem likt, så finner filteret alle
              oppskriftene med ingrediensen.
            </p>
            <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
              {similarNames.map((pair) => (
                <li
                  key={pair.map((use) => use.name).join("|")}
                  className="grid gap-1 py-3 text-sm sm:grid-cols-2 sm:gap-4"
                >
                  {pair.map(({ name, recipes }) => (
                    <p key={name}>
                      <span className="font-semibold">{name}</span>{" "}
                      <span className="text-ink/60">i </span>
                      {recipes.map((recipe, index) => (
                        <span key={recipe.id}>
                          {index > 0 && ", "}
                          <Link
                            to={`/oppskrifter/${recipe.id}`}
                            className="underline-offset-4 hover:underline"
                          >
                            {recipe.title}
                          </Link>
                        </span>
                      ))}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

export default DataCheckPage;

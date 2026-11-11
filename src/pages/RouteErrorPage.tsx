import { Link, useRevalidator, useRouteError } from "react-router";
import Container from "../components/Container";
import { RecipesUnavailableError } from "../recipes/recipes";

// Shown instead of a page when its loader (or the page itself) fails: the errorElement
// in routes.tsx. The header and footer stay, so you can still go somewhere else.
function RouteErrorPage() {
  const error = useRouteError();
  // revalidate(): runs the loaders again. If they work this time, the page is shown.
  const revalidator = useRevalidator();
  const isRetrying = revalidator.state === "loading";

  // The recipes couldn't be fetched (no internet, the CMS is down …), or something else
  const couldNotFetch = error instanceof RecipesUnavailableError;

  return (
    <section className="flex-1 bg-white font-mono">
      <Container>
        <h1 className="font-display text-5xl uppercase md:text-6xl">
          {couldNotFetch ? "Kunne ikke hente oppskriftene" : "Noe gikk galt"}
        </h1>
        <p className="mt-3 text-neutral-600">
          {couldNotFetch
            ? "Sjekk internettforbindelsen, og prøv igjen."
            : "Prøv igjen, eller gå til forsiden."}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => revalidator.revalidate()}
            disabled={isRetrying}
            className="min-h-11 bg-ink px-5 py-2 text-sm text-white transition-colors hover:bg-red-600 disabled:opacity-60"
          >
            {isRetrying ? "Prøver …" : "Prøv igjen"}
          </button>
          <Link to="/" className="underline hover:text-red-600">
            Til forsiden
          </Link>
        </div>
      </Container>
    </section>
  );
}

export default RouteErrorPage;

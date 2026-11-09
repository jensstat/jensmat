import { Link, useParams } from "react-router";
import { getRecipe } from "../recipes/recipes";

function RecipePage() {
  // Reads the :id part of the address: /oppskrifter/laksewrap → id = "laksewrap"
  const { id } = useParams();
  const recipe = id ? getRecipe(id) : undefined;

  // An address with no recipe behind it
  if (!recipe) {
    return (
      <section className="flex-1 bg-white font-mono">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-8 lg:py-14">
          <h1 className="font-display text-5xl uppercase">
            Fant ikke oppskriften
          </h1>
          <Link
            to="/"
            className="mt-6 inline-block underline hover:text-red-600"
          >
            Til forsiden
          </Link>
        </div>
      </section>
    );
  }
  return (
    <article className="flex-1 bg-white font-mono">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8 lg:py-14">
        <p className="text-sm text-neutral-500 uppercase">
          {recipe.category} · {recipe.minutes} min · {recipe.servings} porsjoner
        </p>
        <h1 className="mt-2 font-display text-5xl uppercase md:text-6xl">
          {recipe.title}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-neutral-600">
          {recipe.description}
        </p>

        {/* Ingredients and steps come here in 3c */}
      </div>
    </article>
  );
}

export default RecipePage;

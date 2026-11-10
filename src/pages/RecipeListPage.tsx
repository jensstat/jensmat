import { getAllRecipes } from "../recipes/recipes";
import { Link } from "react-router";
import { formatMinutes } from "../recipes/display";

function RecipeListPage() {
  const recipes = getAllRecipes();
  return (
    <section className="flex-1 bg-white font-sans text-ink">
      <div className="mx-auto w-full max-w-[93.75rem] px-5 py-8 lg:px-10 lg:py-12">
        <h1 className="font-serif text-[2rem] leading-tight font-semibold lg:text-[2.75rem]">
          Oppskrifter
        </h1>
        <p className="mt-2 text-lg font-light text-ink/70 lg:text-[1.375rem]">
          Finn noe godt å lage!
        </p>
        <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 sm:mt-10 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <Link to={`/oppskrifter/${recipe.id}`} className="group block">
                <div className="flex aspect-[4/3] items-center justify-center bg-panel font-serif text-4xl font-semibold text-ink/15 sm:text-6xl">
                  {recipe.title.charAt(0)}
                </div>
                <h2 className="mt-2 font-serif text-base leading-snug font-semibold group-hover:text-gold sm:mt-3 sm:text-xl">
                  {recipe.title}
                </h2>
                <p className="mt-1 text-sm text-ink/60">
                  {formatMinutes(recipe.minutes)} - {recipe.category}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default RecipeListPage;

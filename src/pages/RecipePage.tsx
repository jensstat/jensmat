import { useState } from "react";
import { Link, useParams } from "react-router";
import IngredientsPanel from "../components/recipe/IngredientsPanel";
import MobileIngredients from "../components/recipe/MobileIngredients";
import RecipeActions from "../components/recipe/RecipeActions";
import RecipeImage from "../components/recipe/RecipeImage";
import RecipeMeta from "../components/recipe/RecipeMeta";
import StepList from "../components/recipe/StepList";
import { recipeLabels } from "../recipes/display";
import { getRecipe } from "../recipes/recipes";
import type { Recipe } from "../recipes/types";
import NotFoundPage from "./NotFoundPage";

// One recipe, at /oppskrifter/:id.
// This part only finds the recipe; RecipeView below draws it.
function RecipePage() {
  // Reads the :id part of the address: /oppskrifter/laksewrap → id = "laksewrap"
  const { id } = useParams();
  const recipe = id ? getRecipe(id) : undefined;

  // An address with no recipe behind it
  if (!recipe) {
    return (
      <NotFoundPage
        title="Fant ikke oppskriften"
        message="Den kan ha fått nytt navn, eller blitt fjernet."
      />
    );
  }

  // key: when you go from one recipe to another, React starts RecipeView afresh,
  // so the portion number starts at the new recipe's own number.
  return <RecipeView key={recipe.id} recipe={recipe} />;
}

interface RecipeViewProps {
  recipe: Recipe;
}

// The recipe, modelled on Gladkokken:
// Desktop: a wide main column (photo, title, steps) and the ingredients in a panel on the right,
//          whose background runs all the way to the right edge of the screen.
// Phones:  everything in one column, and the ingredients behind an "Ingredienser" bar at the bottom.
function RecipeView({ recipe }: RecipeViewProps) {
  // The chosen number of portions. Lives here, because the panel on desktop
  // and the panel on phones both need it, and must show the same number.
  const [servings, setServings] = useState(recipe.servings);

  const panelProps = {
    ingredients: recipe.ingredients,
    servings,
    baseServings: recipe.servings,
    onServingsChange: setServings,
  };

  return (
    // The background trick: from lg:, the left half of the screen is white and the right half
    // is the panel colour. The main column is white on top, so the panel colour only shows to the
    // right of it: through the panel, and on out to the edge of the screen on wide screens.
    <article className="flex-1 bg-white font-sans text-ink lg:bg-[linear-gradient(to_right,white_50%,var(--color-panel)_50%)]">
      {/* Up to 1500px wide (93.75rem, like Gladkokken). Two columns from lg: the main column, and a panel
          of 420px (480px from xl). On phones: one column. Sizes in rem, so they follow the 110 % in index.css. */}
      <div className="mx-auto grid w-full max-w-[93.75rem] lg:grid-cols-[minmax(0,1fr)_26.25rem] xl:grid-cols-[minmax(0,1fr)_30rem]">
        {/* The main column */}
        <div className="bg-white px-5 pt-5 pb-12 lg:px-10 lg:pt-6 lg:pb-20 xl:pr-16">
          <Link
            to="/oppskrifter"
            className="text-sm text-ink/60 hover:text-gold"
          >
            ← Alle oppskrifter
          </Link>

          <div className="mt-3">
            <RecipeImage src={recipe.image} alt={recipe.title} />
          </div>

          <div className="mt-5">
            <RecipeActions />
          </div>

          {/* The title: 26/32px on phones, 44/56px on desktop, like Gladkokken (in rem: 1.625rem = 26px) */}
          <h1 className="mt-6 font-serif text-[1.625rem] leading-8 font-semibold lg:mt-8 lg:text-[2.75rem] lg:leading-[3.5rem]">
            {recipe.title}
          </h1>
          {/* The introduction: light and a bit larger than the text, like Gladkokken's */}
          <p className="mt-3 max-w-3xl text-lg leading-7 font-light lg:mt-4 lg:text-[1.375rem] lg:leading-[2.375rem]">
            {recipe.description}
          </p>

          <div className="mt-6">
            <RecipeMeta
              minutes={recipe.minutes}
              servings={servings}
              labels={recipeLabels(recipe)}
            />
          </div>

          <h2 className="mt-12 mb-8 font-serif text-[1.375rem] font-semibold lg:mt-16 lg:text-[1.75rem]">
            Slik gjør du
          </h2>
          <div className="max-w-3xl">
            <StepList steps={recipe.steps} />
          </div>

          {/* Tips and source, only when the recipe has them */}
          {(recipe.tips || recipe.source) && (
            <aside className="mt-12 max-w-3xl bg-panel p-6">
              {recipe.tips && (
                <>
                  <p className="text-sm font-medium uppercase tracking-wider">
                    Tips
                  </p>
                  <p className="mt-2 text-base leading-7 lg:text-lg lg:leading-8">
                    {recipe.tips}
                  </p>
                </>
              )}
              {recipe.source && (
                <p className="mt-3 text-sm text-ink/60">
                  Kilde: {recipe.source}
                </p>
              )}
            </aside>
          )}
        </div>

        {/* The ingredient panel, desktop only. The content is sticky, so it stays in view while you
            read the steps, and scrolls on its own if the list is taller than the screen. */}
        <aside className="hidden bg-panel lg:block lg:px-10 lg:py-16 xl:px-16">
          <div className="sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto">
            <IngredientsPanel {...panelProps} />
          </div>
        </aside>

        {/* Phones: the "Ingredienser" bar at the bottom of the screen, and the full-screen panel.
            As the last item in the grid, the bar sticks to the bottom until the recipe ends. */}
        <MobileIngredients {...panelProps} />
      </div>
    </article>
  );
}

export default RecipePage;

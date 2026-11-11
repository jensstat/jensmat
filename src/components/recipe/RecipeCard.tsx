import { Link } from "react-router";
import { cardDetails } from "../../recipes/display";
import { imagePosition, imageSrcSet, imageUrl } from "../../recipes/image";
import { isIncomplete } from "../../recipes/types";
import type { Recipe } from "../../recipes/types";

interface RecipeCardProps {
  recipe: Recipe;
  variant?: "card" | "row"; // optional; "card" if not set
}

interface CardPhotoProps {
  recipe: Recipe;
  className: string; // the box's size and letter size, which differ between card and row
  // How wide the photo is shown, for <img sizes>: "80px", or "50vw" (half the screen).
  // The browser uses it to fetch the smallest photo that's sharp enough (see recipes/image.ts).
  sizes: string;
}

// The recipe's photo, or the first letter of the title if there's no photo yet.
// Also used by RecipeSuggestion.
export function CardPhoto({ recipe, className, sizes }: CardPhotoProps) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-panel font-serif font-semibold text-ink/15 ${className}`}
    >
      {recipe.image ? (
        <img
          src={imageUrl(recipe, 640)}
          srcSet={imageSrcSet(recipe)}
          sizes={sizes}
          alt={recipe.title}
          // lazy: photos further down the list are only fetched when you scroll near them
          loading="lazy"
          style={{ objectPosition: imagePosition(recipe) }}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        recipe.title.charAt(0)
      )}
    </div>
  );
}

// The line under the title: "30 min · Middag", and an "Uferdig" label on incomplete recipes.
// Shows nothing if the recipe has neither (a recipe with only a title is always "Uferdig").
// Also used by RecipeSuggestion.
export function CardDetails({ recipe }: { recipe: Recipe }) {
  const details = cardDetails(recipe);
  const incomplete = isIncomplete(recipe);
  if (!details && !incomplete) return null;

  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink/60">
      {details && <span>{details}</span>}
      {incomplete && (
        <span className="rounded-full border border-ink/25 px-2 leading-5 text-ink/70">
          Uferdig
        </span>
      )}
    </p>
  );
}

function RecipeCard({ recipe, variant = "card" }: RecipeCardProps) {
  if (variant === "row") {
    return (
      <Link
        to={`/oppskrifter/${recipe.id}`}
        className="group flex items-center gap-4"
      >
        <CardPhoto
          recipe={recipe}
          sizes="80px"
          className="h-20 w-20 shrink-0 text-2xl"
        />
        <div>
          <h2 className="font-serif text-lg leading-snug font-semibold group-hover:text-gold">
            {recipe.title}
          </h2>
          <CardDetails recipe={recipe} />
        </div>
      </Link>
    );
  }
  return (
    <Link to={`/oppskrifter/${recipe.id}`} className="group block">
      {/* Two cards per row (half the screen), three from 1024 px, four (about 300 px each) from 1280 px */}
      <CardPhoto
        recipe={recipe}
        sizes="(min-width: 1280px) 320px, (min-width: 1024px) 33vw, 50vw"
        className="aspect-[4/3] text-4xl sm:text-6xl"
      />

      <h2 className="mt-2 font-serif text-base leading-snug font-semibold group-hover:text-gold sm:mt-3 sm:text-xl">
        {recipe.title}
      </h2>
      <CardDetails recipe={recipe} />
    </Link>
  );
}

export default RecipeCard;

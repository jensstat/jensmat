import { Link } from "react-router";
import { formatMinutes } from "../../recipes/display";
import type { Recipe } from "../../recipes/types";

interface RecipeCardProps {
  recipe: Recipe;
  variant?: "card" | "row"; // optional; "card" if not set
}

interface CardPhotoProps {
  recipe: Recipe;
  className: string; // the box's size and letter size, which differ between card and row
}

// The recipe's photo, or the first letter of the title if there's no photo yet.
function CardPhoto({ recipe, className }: CardPhotoProps) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-panel font-serif font-semibold text-ink/15 ${className}`}
    >
      {recipe.image ? (
        <img
          src={recipe.image}
          alt={recipe.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        recipe.title.charAt(0)
      )}
    </div>
  );
}

function RecipeCard({ recipe, variant = "card" }: RecipeCardProps) {
  if (variant === "row") {
    return (
      <Link
        to={`/oppskrifter/${recipe.id}`}
        className="group flex items-center gap-4"
      >
        <CardPhoto recipe={recipe} className="h-20 w-20 shrink-0 text-2xl" />
        <div>
          <h2 className="font-serif text-lg leading-snug font-semibold group-hover:text-gold">
            {recipe.title}
          </h2>
          <p className="mt-1 text-sm text-ink/60">
            {formatMinutes(recipe.minutes)} · {recipe.category}
          </p>
        </div>
      </Link>
    );
  }
  return (
    <Link to={`/oppskrifter/${recipe.id}`} className="group block">
      <CardPhoto
        recipe={recipe}
        className="aspect-[4/3] text-4xl sm:text-6xl"
      />

      <h2 className="mt-2 font-serif text-base leading-snug font-semibold group-hover:text-gold sm:mt-3 sm:text-xl">
        {recipe.title}
      </h2>
      <p className="mt-1 text-sm text-ink/60">
        {formatMinutes(recipe.minutes)} · {recipe.category}
      </p>
    </Link>
  );
}

export default RecipeCard;

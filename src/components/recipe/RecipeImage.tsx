import { imagePosition, imageSrcSet, imageUrl } from "../../recipes/image";
import type { Recipe } from "../../recipes/types";

interface RecipeImageProps {
  recipe: Recipe;
}

// How wide the photo is shown: the whole screen on phones, at most 960 px (60rem) on
// bigger screens. The browser fetches a photo that's sharp enough (see recipes/image.ts).
const photoSizes = "(min-width: 1024px) 960px, 100vw";

// The recipe's photo (16:9, like Gladkokken). Without a photo, a calm, lower placeholder (5:2),
// so a missing photo doesn't take up half the screen.
function RecipeImage({ recipe }: RecipeImageProps) {
  const alt = recipe.title;
  if (recipe.image) {
    return (
      // On paper: lower, so the recipe starts on the first page
      <img
        src={imageUrl(recipe, 1280)}
        srcSet={imageSrcSet(recipe)}
        sizes={photoSizes}
        alt={alt}
        style={{ objectPosition: imagePosition(recipe) }}
        className="aspect-video w-full object-cover print:aspect-auto print:h-[7cm]"
      />
    );
  }

  return (
    // role="img" + aria-label: screen readers read it like a picture
    <div
      role="img"
      aria-label={`${alt} (bilde kommer)`}
      // print:hidden: a placeholder is only empty space on paper
      className="flex aspect-[5/2] w-full items-center justify-center bg-panel print:hidden"
    >
      {/* The first letter of the title, large and faint */}
      <span
        aria-hidden="true"
        className="font-serif text-7xl font-semibold text-ink/15 md:text-8xl"
      >
        {alt.charAt(0)}
      </span>
    </div>
  );
}

export default RecipeImage;

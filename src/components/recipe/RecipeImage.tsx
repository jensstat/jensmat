interface RecipeImageProps {
  src?: string;
  alt: string;
}

// The recipe's photo (16:9, like Gladkokken). Without a photo, a calm, lower placeholder (5:2),
// so a missing photo doesn't take up half the screen.
function RecipeImage({ src, alt }: RecipeImageProps) {
  if (src) {
    return (
      // On paper: lower, so the recipe starts on the first page
      <img
        src={src}
        alt={alt}
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

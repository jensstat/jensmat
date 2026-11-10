// The overview of all recipes, at /oppskrifter.
// Same look as the recipe page: Figtree text, Source Serif 4 headings, ink colour.

function RecipeListPage() {
  return (
    <section className="flex-1 bg-white font-sans text-ink">
      {/* Same width and side margins as the recipe page, so the two feel like one section */}
      <div className="mx-auto w-full max-w-[93.75rem] px-5 py-8 lg:px-10 lg:py-12">
        <h1 className="font-serif text-[2rem] leading-tight font-semibold lg:text-[2.75rem]">
          Oppskrifter
        </h1>
        <p className="mt-2 text-lg font-light text-ink/70 lg:text-[1.375rem]">
          Finn noe godt å lage!
        </p>
      </div>
    </section>
  );
}

export default RecipeListPage;

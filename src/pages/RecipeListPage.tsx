import { getAllRecipes } from "../recipes/recipes";
import RecipeCard from "../components/recipe/RecipeCard";
import { useState } from "react";

// The ways the recipes can be shown
type View = "standard" | "list";

const layouts: Record<View, string> = {
  standard:
    "grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4",
  list: "grid gap-y-3 lg:grid-cols-2 lg:gap-x-10",
};

// The buttons for the views: which view, and the text on the button
const viewOptions: { value: View; label: string; icon: React.ReactNode }[] = [
  { value: "standard", label: "Rutenett", icon: <GridIcon /> },
  { value: "list", label: "Liste", icon: <ListIcon /> },
];

// Small icons for the view buttons. fill="currentColor": they follow the text colour.
function GridIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="8" height="8" />
      <rect x="13" y="3" width="8" height="8" />
      <rect x="3" y="13" width="8" height="8" />
      <rect x="13" y="13" width="8" height="8" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="6" height="6" />
      <rect x="11" y="6" width="10" height="2" />
      <rect x="3" y="14" width="6" height="6" />
      <rect x="11" y="16" width="10" height="2" />
    </svg>
  );
}

function RecipeListPage() {
  const recipes = getAllRecipes();
  const [view, setView] = useState<View>("standard");

  return (
    <section className="flex-1 bg-white font-sans text-ink">
      <div className="mx-auto w-full max-w-[93.75rem] px-5 py-8 lg:px-10 lg:py-12">
        <h1 className="font-serif text-[2rem] leading-tight font-semibold lg:text-[2.75rem]">
          Oppskrifter
        </h1>
        <p className="mt-2 text-lg font-light text-ink/70 lg:text-[1.375rem]">
          Finn noe godt å lage!
        </p>
        <div className="mt-8 flex items-center justify-between">
          <p>{recipes.length} oppskrifter</p>
          <div className="flex gap-1">
            {viewOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setView(option.value)}
                aria-pressed={view === option.value}
                aria-label={option.label}
                className={`px-3 py-1.5 text-sm ${view === option.value ? "bg-ink text-white" : "text-ink/60 hover:text-ink"}`}
              >
                {option.icon}
              </button>
            ))}
          </div>
        </div>

        <ul className={`mt-4 ${layouts[view]}`}>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <RecipeCard
                recipe={recipe}
                variant={view === "list" ? "row" : "card"}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default RecipeListPage;

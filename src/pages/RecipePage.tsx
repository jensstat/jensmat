import { lazy, Suspense, useState } from "react";
import {
  Link,
  useLoaderData,
  useLocation,
  useSearchParams,
} from "react-router";
import IngredientsPanel from "../components/recipe/IngredientsPanel";
import RecipeActions from "../components/recipe/RecipeActions";
import RecipeImage from "../components/recipe/RecipeImage";
import KeepScreenOn from "../components/recipe/KeepScreenOn";
import RecipeMeta from "../components/recipe/RecipeMeta";
import RecipeSectionNav from "../components/recipe/RecipeSectionNav";
import StepList from "../components/recipe/StepList";
import { recipeLabels, recipeSections } from "../recipes/display";
import { listAddress } from "../recipes/listLink";
import type { recipeLoader } from "../loaders";
import { isIncomplete } from "../recipes/types";
import type { Recipe } from "../recipes/types";
import { useLoginHint } from "../auth/loginHint";
import { readDraft } from "../admin/draft";
import Notice from "../components/Notice";
import { useNotice } from "../components/useNotice";
import NotFoundPage from "./NotFoundPage";

// «Rediger»'s fields, in their own file: downloaded only when you press «Rediger»,
// so visitors never get it (or Firebase, which it uses to save)
const RecipeEditor = lazy(() => import("../admin/RecipeEditor"));

// One recipe, at /oppskrifter/:id.
// This part only finds the recipe; RecipeView below draws it.
function RecipePage() {
  // The recipe for the :id in the address (/oppskrifter/laksewrap), fetched by the
  // loader before the page is shown (loaders.ts). undefined if there's no such recipe.
  const recipe = useLoaderData<typeof recipeLoader>();
  // «Lagret ✓» after «Rediger». Here, not in RecipeView: RecipeView starts afresh
  // when the portions change (its key), and the message must survive that
  const [notice, showNotice] = useNotice();

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
  // so the portion number starts at the new recipe's own number. The portions are in
  // the key too, so it also starts afresh when «Rediger» changes them (4 → 2)
  return (
    <>
      <RecipeView
        key={`${recipe.id}-${recipe.servings}`}
        recipe={recipe}
        onSaved={() => showNotice("Lagret ✓")}
      />
      {notice && <Notice message={notice} />}
    </>
  );
}

interface RecipeViewProps {
  recipe: Recipe;
  onSaved: () => void; // after «Lagre» in «Rediger»
}

// The recipe, modelled on Gladkokken (desktop) and Matprat (phones):
// Desktop: a main column (photo, title, steps) and the ingredients in a panel on the right,
//          whose background runs all the way to the right edge of the screen.
//          The same width as the header, so the photo starts under the logo and the
//          ingredients end under the menu.
// Phones:  everything in one column: the ingredients in the page, before the steps, and a bar
//          under the header to jump between "Ingredienser", "Slik gjør du" and "Tips".
//
// A recipe can be half-done (only the title is required), so every part is only drawn
// when the recipe has it. Without ingredients there's no panel, and the page is one column.
function RecipeView({ recipe, onSaved }: RecipeViewProps) {
  // The chosen number of portions. Lives here, because the panel on desktop
  // and the panel on phones both need it, and must show the same number.
  // ?? 1: a recipe without portions has no portion selector, so the number is never shown.
  const [servings, setServings] = useState(recipe.servings ?? 1);
  // Where we came from: its state may hold the list's search and filters (listLink.ts)
  const location = useLocation();
  // The admin's «Rediger»: shown when logged in on this browser (auth/loginHint.ts).
  // editing = the recipe is a form instead of text. Kept in the address
  // (/oppskrifter/laksewrap?rediger), so a reload stays in the editor, and the
  // Datasjekk can link straight to it, even to one field (?rediger=cuisine)
  const canEdit = useLoginHint();
  const [searchParams, setSearchParams] = useSearchParams();
  const editing = canEdit && searchParams.has("rediger");

  // replace: opening and closing the editor isn't a step of its own in the history,
  // so the back button leaves the page (and asks first if there are unsaved changes).
  // state: keep where we came from, for «← Alle oppskrifter» (listLink.ts).
  // preventScrollReset: stay where you are on the page
  function setEditing(on: boolean) {
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current);
        if (on) params.set("rediger", "");
        else params.delete("rediger");
        return params;
      },
      { replace: true, state: location.state, preventScrollReset: true },
    );
  }

  const hasIngredients = recipe.ingredients.length > 0;
  // The parts the phone's section bar can jump to
  const sections = recipeSections(recipe);
  // Each part's scroll margin: as tall as the header and the section bar, so jumping
  // to it doesn't hide its heading under them (the bar is only on phones)
  const sectionScroll =
    "scroll-mt-[calc(var(--header-height,0px)+5rem)] lg:scroll-mt-[calc(var(--header-height,0px)+1.5rem)]";

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
    // Without ingredients there's no panel, so no panel colour either.
    // lg:flex + lg:flex-1 on the grid: the columns always reach the footer, so on a short
    // recipe the panel colour doesn't leak out under the main column.
    <article
      className={`flex-1 bg-white font-sans text-ink ${
        hasIngredients
          ? "lg:flex lg:flex-col lg:bg-[linear-gradient(to_right,white_50%,var(--color-panel)_50%)] print:bg-none"
          : ""
      }`}
    >
      {/* The header's width (max-w-7xl). Two columns from lg: the main column, and a panel
          of 420px (480px from xl). On phones: one column, minmax(0,1fr) so it can't grow
          wider than the screen (a grid column is otherwise as wide as its widest content,
          like the editor's section bar). Sizes in rem, so they follow the 90 % in index.css.
          The panel colour can start no further left than the middle of the screen (the background
          trick above); it doesn't, since the container is always more than twice the panel's width. */}
      <div
        className={`mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)] ${
          hasIngredients
            ? "lg:flex-1 lg:grid-cols-[minmax(0,1fr)_26.25rem] xl:grid-cols-[minmax(0,1fr)_30rem] print:grid-cols-1"
            : ""
        }`}
      >
        {/* The main column. The header's side padding on the left (px-4 md:px-8), so it lines up
            with the logo; from lg more on the right, as space before the panel.
            Without a panel next to it, it keeps about the same width as with one (60rem),
            so the photo doesn't stretch across the whole screen. */}
        <div
          className={`bg-white px-4 pt-5 pb-12 md:px-8 lg:pt-6 lg:pr-10 lg:pb-20 xl:pr-16 ${
            hasIngredients ? "" : "w-full max-w-[60rem]"
          }`}
        >
          {/* Back to the list you came from, with its search and filters (recipes/listLink.ts) */}
          <Link
            to={listAddress(location.state)}
            className="text-sm text-ink/60 hover:text-gold print:hidden"
          >
            ← Alle oppskrifter
          </Link>

          <div className="mt-3">
            <RecipeImage recipe={recipe} />
          </div>

          <div className="mt-5">
            <RecipeActions
              onEdit={canEdit && !editing ? () => setEditing(true) : undefined}
              hasDraft={canEdit && readDraft(recipe.id) !== undefined}
            />
          </div>

          {editing ? (
            // While it downloads (a moment, the first time)
            <Suspense fallback={<p className="mt-6 text-ink/60">Laster …</p>}>
              <RecipeEditor
                recipe={recipe}
                onClose={() => setEditing(false)}
                startAt={searchParams.get("rediger") || undefined}
                onSaved={onSaved}
              />
            </Suspense>
          ) : (
            // The recipe as everyone sees it. While editing, the editor has all of it
            // as fields instead (on desktop the panel keeps showing the saved ingredients)
            <>
              {/* The title: 26/32px on phones, 44/56px on desktop, like Gladkokken (in rem: 1.625rem = 26px) */}
              <h1 className="mt-6 font-serif text-[1.625rem] leading-8 font-semibold lg:mt-8 lg:text-[2.75rem] lg:leading-[3.5rem]">
                {recipe.title}
              </h1>
              {/* The introduction: light and a bit larger than the text, like Gladkokken's */}
              {recipe.description && (
                <p className="mt-3 max-w-3xl text-lg leading-7 font-light lg:mt-4 lg:text-[1.375rem] lg:leading-[2.375rem]">
                  {recipe.description}
                </p>
              )}

              {/* Time, portions, difficulty and labels (main ingredient, cuisine, "Passer til" …).
                  Each only if the recipe has it; nothing at all if it has none of them. */}
              <RecipeMeta
                minutes={recipe.minutes}
                servings={recipe.servings === undefined ? undefined : servings}
                difficulty={recipe.difficulty}
                labels={recipeLabels(recipe)}
                className="mt-6"
              />

              {/* An incomplete recipe (saved quickly, to be filled in later) says so */}
              {isIncomplete(recipe) && (
                <div className="mt-10 max-w-3xl border-l-4 border-gold bg-panel px-6 py-5">
                  <p className="font-serif text-lg font-semibold">
                    Denne oppskriften er ikke ferdig ennå
                  </p>
                  <p className="mt-1 text-ink/70">
                    Ingrediensene og resten kommer snart.
                  </p>
                </div>
              )}

              {/* Phones: a bar under the header to jump between the parts (like Matprat) */}
              <RecipeSectionNav sections={sections} />

              {/* Phones and paper: the ingredients in the page, before the steps, with the portions.
                  (On desktop they're in the side panel on the right, which doesn't work on paper.)
                  -mx-4 md:-mx-8 (the main column's padding): the panel colour reaches the screen edges. */}
              {hasIngredients && (
                <section
                  id="ingredienser"
                  className={`-mx-4 mt-6 bg-panel px-4 py-8 md:-mx-8 md:px-8 lg:hidden print:mx-0 print:mt-10 print:block print:max-w-3xl print:bg-transparent print:p-0 ${sectionScroll}`}
                >
                  <IngredientsPanel {...panelProps} />
                </section>
              )}

              {/* Not every recipe has steps */}
              {recipe.steps.length > 0 && (
                <section id="slik-gjor-du" className={sectionScroll}>
                  <h2 className="mt-12 mb-6 font-serif text-[1.375rem] font-semibold break-after-avoid lg:mt-16 lg:text-[1.75rem]">
                    Slik gjør du
                  </h2>
                  <div className="max-w-3xl">
                    {/* Cooking mode: keep the screen on, and tick off the steps by tapping the numbers */}
                    <KeepScreenOn />
                    <p className="mt-3 mb-8 text-sm text-ink/60 print:hidden">
                      Trykk på tallet når et steg er gjort.
                    </p>
                    <StepList steps={recipe.steps} />
                  </div>
                </section>
              )}

              {/* Tips and source, only when the recipe has them */}
              {(recipe.tips || recipe.source) && (
                <aside
                  id="tips"
                  className={`mt-12 max-w-3xl bg-panel p-6 ${sectionScroll}`}
                >
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
                    // first:mt-0: no space above it when there are no tips before it
                    <p className="mt-3 text-sm text-ink/60 first:mt-0">
                      Kilde: {recipe.source}
                    </p>
                  )}
                </aside>
              )}
            </>
          )}
        </div>

        {/* The ingredient panel, desktop only. The content is sticky, so it stays in view while you
            read the steps (2rem under the header, measured by Header.tsx), and scrolls on its own
            if the list is taller than the screen. pr-8: the header's padding, so the list ends
            under the menu; the panel colour itself goes on to the screen edge. */}
        {hasIngredients && (
          <aside className="hidden bg-panel lg:block lg:py-16 lg:pr-8 lg:pl-10 xl:pl-14 print:hidden">
            <div className="sticky top-[calc(var(--header-height,0px)+2rem)] max-h-[calc(100dvh-var(--header-height,0px)-4rem)] overflow-y-auto">
              {/* While editing, the ingredients are fields in the editor; showing the
                  saved list here as well would look like two different lists */}
              {editing ? (
                <p className="text-ink/60">
                  Ingrediensene redigeres i skjemaet til venstre.
                </p>
              ) : (
                <IngredientsPanel {...panelProps} />
              )}
            </div>
          </aside>
        )}
      </div>
    </article>
  );
}

export default RecipePage;

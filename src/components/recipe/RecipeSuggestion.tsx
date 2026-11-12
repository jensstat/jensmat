import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { listState } from "../../recipes/listLink";
import type { Recipe } from "../../recipes/types";
import { CardDetails, CardPhoto } from "./RecipeCard";

// "Hva med…?" at the top of the overview, in two versions that share one box:
// - RecipeSuggestion: a suggested recipe, and a button for another (most days)
// - PizzaSuggestion: "Pizzatid!", linking to the pizza calculator (Fridays)
// They only show things; the page decides which one, picks the recipe (recipes/suggest.ts)
// and holds the state. No outer margin or width: the page decides where it goes and how wide.
//
// Always a row: a square picture on the left and the text on the right.
// From lg, in the overview's right column: a bigger picture, no border (the column
// itself sets it apart), and the box is as tall as the left column (h-full), with the
// content centred. On phones the border marks the box between the heading and the search.

// The picture: a square on phones and tablets (h-24/32), and from lg 4:3 like the
// recipe cards below it (the height is set, aspect-ratio gives the width), growing
// with the room the overview gives it. Shared by the photo and the pizza.
const pictureSize =
  "h-24 w-24 shrink-0 sm:h-32 sm:w-32 lg:aspect-[4/3] lg:h-40 lg:w-auto xl:h-56";

interface SuggestionBoxProps {
  picture: ReactNode; // the square on the left
  label: string; // the small line above the title, like "Hva med…"
  title: string;
  to: string; // where the box leads
  children?: ReactNode; // anything under the title: details, a button …
}

// The frame both versions share: picture on the left, text on the right, thin border.
// A white box: the photo's placeholder is gray (bg-panel), so it shows up.
//
// The whole box is a link, but a button inside it must still work.
// A button can't be inside a link, so the title is the only link, and it's "stretched":
// its after: part is an invisible layer over the whole box (absolute, inset-0),
// placed against the box (relative). A button can be lifted above it (relative z-10).
// isolate: the box gets its own stack of layers, so that z-10 only counts inside the box.
// Without it, the button would also be lifted above the sticky header (z-10) when you scroll.
function SuggestionBox({
  picture,
  label,
  title,
  to,
  children,
}: SuggestionBoxProps) {
  // The list's ?… part, brought along like on the cards (recipes/listLink.ts)
  const { search } = useLocation();
  return (
    <div className="group relative isolate flex items-center gap-4 border border-ink/15 p-3 transition-colors hover:border-ink/40 sm:gap-6 sm:p-4 lg:h-full lg:border-0 lg:p-0">
      {picture}
      <div>
        <p className="text-xs font-semibold tracking-widest text-ink/60 uppercase">
          {label}
        </p>
        <h2 className="mt-1 font-serif text-xl leading-snug font-semibold sm:text-2xl xl:text-[1.75rem]">
          <Link
            to={to}
            state={listState(search)}
            className="after:absolute after:inset-0 group-hover:text-gold"
          >
            {title}
          </Link>
        </h2>
        {children}
      </div>
    </div>
  );
}

interface RecipeSuggestionProps {
  recipe: Recipe;
  onShowAnother: () => void;
}

// The usual version: the recipe's photo, title and "30 min · Middag", and a button for another.
function RecipeSuggestion({ recipe, onShowAnother }: RecipeSuggestionProps) {
  return (
    <SuggestionBox
      picture={
        // sizes: the picture's width (up to about 270px from xl)
        <CardPhoto
          recipe={recipe}
          sizes="(min-width: 1024px) 270px, 128px"
          className={`${pictureSize} text-4xl sm:text-5xl lg:text-7xl`}
        />
      }
      label="Hva med…"
      title={`${recipe.title}?`}
      to={`/oppskrifter/${recipe.id}`}
    >
      {/* The same line as on the cards */}
      <CardDetails recipe={recipe} />
      {/* An outlined button: a smaller action than the dark "Vis alle oppskrifter".
          Fills in dark on hover. The arrows say "a new one" without words.
          Less padding on phones, so it fits on one line at 360px (and wraps on smaller screens). */}
      <button
        type="button"
        onClick={onShowAnother}
        className="relative z-10 mt-3 inline-flex min-h-11 items-center gap-1.5 border border-ink/25 px-2.5 py-1.5 text-sm transition-colors sm:gap-2 sm:px-3 hover:border-ink hover:bg-ink hover:text-white "
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 11a8 8 0 0 0-14.5-4.5L4 8" />
          <path d="M4 3v5h5" />
          <path d="M4 13a8 8 0 0 0 14.5 4.5L20 16" />
          <path d="M20 21v-5h-5" />
        </svg>
        Vis et annet forslag
      </button>
    </SuggestionBox>
  );
}

// The Friday version: a pizza slice instead of a photo, linking to the pizza calculator.
// No "another suggestion" button: Friday is pizza day.
export function PizzaSuggestion() {
  return (
    <SuggestionBox
      picture={
        <div
          className={`flex items-center justify-center bg-panel text-ink/25 ${pictureSize}`}
        >
          {/* A pizza slice: the slice, the crust, and three slices of pepperoni */}
          <svg
            viewBox="0 0 24 24"
            className="h-12 w-12 sm:h-16 sm:w-16 lg:h-24 lg:w-24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.4}
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3 3.5 18.5a19 19 0 0 0 17 0Z" />
            <path d="M5.2 15.6a16 16 0 0 0 13.6 0" />
            <circle cx="12" cy="9.5" r="1.2" fill="currentColor" />
            <circle cx="9.6" cy="13.5" r="1.2" fill="currentColor" />
            <circle cx="14.3" cy="14" r="1.2" fill="currentColor" />
          </svg>
        </div>
      }
      label="Det er fredag"
      title="Pizzatid!"
      to="/pizza"
    >
      <p className="mt-1 text-sm text-ink/60">
        Regn ut deigen med pizzakalkulatoren
      </p>
    </SuggestionBox>
  );
}

export default RecipeSuggestion;

import { useId, useRef } from "react";
import IngredientsPanel from "./IngredientsPanel";
import type { IngredientsPanelProps } from "./IngredientsPanel";

// Phones only (lg:hidden): an "Ingredienser" bar that sticks to the bottom of the screen,
// and opens the ingredients in a full-screen panel, like Gladkokken's ingredient menu.
//
// The panel is the browser's own <dialog>. showModal() puts it on top of everything,
// keeps Tab inside it, and closes it on Esc, without us writing that code ourselves.
function MobileIngredients(props: Omit<IngredientsPanelProps, "headingId">) {
  // useRef: a handle on the <dialog> element, so we can call showModal() and close() on it.
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();

  return (
    <>
      {/* sticky bottom-0: stays at the bottom of the screen while you scroll the recipe,
          and stops above the footer at the end. */}
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="sticky bottom-0 z-10 flex w-full items-center justify-between bg-ink px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-white lg:hidden print:hidden"
      >
        <span className="text-base font-medium uppercase tracking-wider">Ingredienser</span>
        <span className="text-sm text-white/70">
          {props.ingredients.length} stk
          {props.baseServings !== undefined && ` · ${props.servings} porsjoner`}
        </span>
      </button>

      {/* The default <dialog> is a small box in the middle; these classes make it fill the screen. */}
      <dialog
        ref={dialogRef}
        aria-labelledby={headingId}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-panel p-0 font-sans text-ink backdrop:bg-ink/40 lg:hidden"
      >
        {/* pb-32: room for the close button at the bottom */}
        <div className="px-5 pt-8 pb-32">
          <IngredientsPanel {...props} headingId={headingId} />
        </div>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Lukk ingredienser"
          className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-ink text-white shadow-lg"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </dialog>
    </>
  );
}

export default MobileIngredients;

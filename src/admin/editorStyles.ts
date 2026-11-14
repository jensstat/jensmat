// The look of «Rediger»'s fields, shared by RecipeEditor and its parts
export const labelClass = "block text-sm font-medium uppercase tracking-wider";
// A field's look, without size or space around it, for fields that set their own
// (the ingredient lines). Two classes for the same thing (w-full and w-44) would
// collide, and which one wins depends on Tailwind, not on the order you write them
export const fieldBaseClass =
  "border border-ink/30 bg-white px-3 py-2 focus:border-ink focus:outline-none";
// A field under its label, as wide as the form
export const fieldClass = `mt-2 block w-full ${fieldBaseClass}`;
// A small button inside the form (↑, ↓, Fjern, + Legg til steg)
export const smallButtonClass =
  "border border-ink/30 px-2 py-1 text-sm hover:border-ink disabled:opacity-30";

// The handle (⠿) to drag a line into a new order (useDragSort). touch-none: a finger
// on it drags the line instead of scrolling the page; select-none: no text selection
// or iPhone pop-up on a long press. Big enough to hit with a finger
export const dragHandleClass =
  "flex h-9 w-9 shrink-0 cursor-grab touch-none select-none items-center justify-center border border-ink/30 text-lg leading-none hover:border-ink active:cursor-grabbing";

// Text boxes grow with the text, so a long step is shown in full instead of
// scrolling inside a small box (field-sizing: content; in newer browsers, others
// keep the fixed size given by rows). min-h: never smaller than about 3 lines
export const growClass = "field-sizing-content min-h-24";

# 09 – History: what was built, and why it was refactored

The code has been reorganised several times along the way. This file explains **what happened, and why**, so the structure makes sense. Newest at the bottom.

**A refactor** means changing how the code is *organised* without changing what the user *sees*. Every refactor below kept the site working, and was checked with screenshots and (later) tests.

---

## 1. The start

*Commits `caba4d7` → `4547f9f`*

- React + TypeScript + Vite + Tailwind set up.
- A front page (`HomePage`), a `Header` and a `Footer`. Pages were switched **by hand** in `App.tsx`, by commenting them in and out.

## 2. The pizza calculator takes shape

*Commits `a90a59c` → `274f4bc`*

- The calculator page with a "card" for hydration.
- **Refactor 1: `NumberField`.** The card was about to be copied seven times, so it became a component with props (`label`, `unit`, `min` …). *Why:* one place to change, instead of seven.
- **Refactor 2: `FieldCard` + `FieldGroup`.** `NumberField` and the new `SelectField` had the same shell (border, label, hint). It moved into `FieldCard`, and the repeated group markup into `FieldGroup`. *Why:* the two fields only differ in what's *inside* the box.
- **The design changed** to black and white, inspired by Stadler Made: the Anton and IBM Plex Mono fonts, square boxes, rows instead of cards, and a red accent.

## 3. The calculator starts to work

*Commits `274f4bc` → `6daa106`. (`274f4bc` is a big commit that contains the end of section 2 and the start of this one.)*

- **State:** the fields went from `defaultValue` (the browser remembers) to `value` + `onChange` (React remembers). All the settings live in **one** object in the page. *Why:* the result needs the same values as the fields.
- **The calculation** (`calculateDough`): baker's percentages, worked backwards from the total dough.
- **Refactor 3: `ResultPanel`** moved out of the page, and the **default values** collected in one `defaults` object, worked back from the house recipe.
- **The yeast, three versions:**
  1. A guessed formula, fitted to the house recipe only.
  2. A formula fitted to three data points from the forum. It turned out the guess gave far too much yeast for long rises.
  3. "Hjemmeoppskrift / Forum-basert" tags, because the data and the house recipe disagree (the house recipe uses about 3 × as much yeast).
- The total was removed from the result, by choice.

## 4. Structure, method and tests

*Commits `66da710` → `d2261de`*

- **Refactor 4: folders by responsibility.** The calculator page was over 300 lines with data, maths and UI mixed. Everything about pizza moved to `src/pizza/`:
  - `settings.ts`: the settings type, `defaults`, and the pizza types.
  - `calculateDough.ts`: the maths.
  - And in the page, `update({ salt })` replaced eleven repeated `setSettings({ ...settings, … })` calls.
  - *Why:* the page should only be about what you *see*. The maths can then be read and tested on its own.
- **Refactor 5: pizza types as one list.** Each type's name, hint and values went from three separate lists into one entry in `pizzaStyles`. *Why:* three lists that must be kept in step will eventually drift apart.
- **The method** ("Fremgangsmåte") with steps that follow the settings.
- **The real yeast chart:** all 61 × 17 cells from `Yeast-Chart.jpg` typed into `yeast.ts`, replacing the formula. Sourdough hidden. Fridge rises get their own step.
- **Refactor 6: `method.ts`.** The step logic moved out of `Instructions.tsx` to `pizza/method.ts`, with clock times counted back from "Stekes kl.". *Why:* so it could be tested.
- **Tests with Vitest:** 24 tests for the yeast chart, the dough maths and the method. They were checked by breaking the code on purpose; the tests caught it.

## 5. Routing and the front page

*Commit `1affebb` (together with the start of the recipes)*

- **React Router:** every page got its own address (`/`, `/pizza`). The `Header` uses `NavLink` instead of remembering the active link in `useState`. *Why:* the address is now the "truth" about which page you're on, so the back button, bookmarks and reload work.
- **The front page** restyled to match: a big heading, a line, a subtitle and two buttons. (A photo was tried and dropped.)

## 6. The recipes

*Commit `1affebb`, and uncommitted work after it*

- **The data model** (`recipes/types.ts`), designed for a future CMS: category, main ingredient as its own field, tags, "Rask" worked out from the time, and fixed lists written once as arrays.
- **The data layer** (`recipes/recipes.ts`): the pages ask `getRecipe(id)`, never the data file directly. *Why:* only this file changes when the recipes move to a CMS.
- **The recipe page** (`/oppskrifter/:id`).
- **Refactor 7: the recipe page split up, and restyled.** The page had grown to one long file. It was split into:
  - `recipes/display.ts`: text formatting (½, "1 t 15 min", labels), with tests.
  - `components/recipe/`: `IngredientList` (ready for portion scaling), `StepList`, `RecipeFacts` and `LabelList`.
  - `Container` and `NotFoundPage`, shared with other pages.
  - A new, simpler look inspired by recipe sites: a fact strip, "STEG 1" labels, fractions instead of decimals.
  - *Why:* the overview cards, portion scaling and filters will reuse these pieces.
- **This documentation** (`docs/`), written after a full review of the code. The issues found are listed in [08 – Status](08-status.md).

## 7. The recipe section gets its own look

*Uncommitted work after `1affebb`*

The recipe page felt "chaotic" with the calculator's typewriter font and black lines. After looking at Gladkokken, Matprat and Meny, the recipe section got **its own, calmer look**:
- **Fonts:** Fraunces (serif) for headings, Inter for text. Only on the recipe pages; the header, front page and calculator are unchanged.
- **Colours:** cream for the ingredient panel, terracotta as the only accent.
- **Layout:** wider (`max-w-7xl`), with the ingredients in a full-height side panel that stays in view (sticky), like Gladkokken.
- **Steps:** big numbered squares with a dotted line.
- **New features:**
  - **A portion selector** (`PortionStepper`). The `scale` prepared in the last refactor made this a small change.
  - **Ingredient groups:** an optional `group` field, so "Til dippen" gets its own heading.
  - **A photo placeholder** for recipes without a photo yet.
- **Replaced:** the "fact strip" (`RecipeFacts`) became one calm line, `RecipeMeta`.
- **New test** `data.test.ts`, which checks every recipe in `data.ts` (unique ids, valid addresses and dates, numbers above 0). It makes adding recipes safer.

## 8. Even closer to Gladkokken

*Uncommitted work after `1affebb`*

Gladkokken's page was measured value by value (fonts, sizes, widths, colours), and the recipe section was moved closer to it:
- **Fonts:** Fraunces/Inter swapped for **Source Serif 4/Figtree**, the closest free matches to Gladkokken's commercial fonts. The **sizes are the same** as Gladkokken's (44px title and 18px text on desktop).
- **Colours:** `ink`, `panel` and `gold` replaced cream and terracotta.
- **Wider:** up to 1500px, with the panel colour continuing to the edge of the screen.
- **Ingredients:** one per line ("**300 g** laks"), and a Gladkokken-style portion box.
- **A menu for the ingredients on phones** (`MobileIngredients`): a bar at the bottom of the screen that opens a full-screen panel. *Why:* on a phone, the photo, steps and a long ingredient list are a lot in one column.
- **"Skriv ut" and "Kopier lenke"** (`RecipeActions`).
- **`IngredientsPanel`** was split out, because the same panel content is now used in two places (the desktop panel and the phone menu).

## 9. Finding the right text size

*Uncommitted work after `1affebb`*

The text size was tuned on a 14" MacBook Pro, by trying browser zoom levels:
1. **110 %** first. But the browser turned out to be zoomed out while testing, so it was too big.
2. **100 %** (normal) next.
3. **90 %** was the one that felt right. It's now one rule in `index.css`, for screens 1280px and wider. Phones keep the normal size.

Along the way, fixed `px` sizes were converted to `rem`, so they follow the rule, and the last 12px text (the yeast tags in the calculator) became `text-sm`. See [05 – Design](05-design.md), section 4b.

## 10. The recipe overview, built step by step

*Commits `4b33a9c` → `216a818`*

The overview page `/oppskrifter` was built **as a tutorial, one small visible step at a time**, the way a developer works without AI help: first the raw data on screen, then structure, then styling, and a component only once the code asked for it.

1. **The route and the page** (`RecipeListPage`, named so it isn't confused with `RecipePage`). This fixed the three links that led to "Fant ikke siden".
2. **Three placeholder recipes** (breakfast, a long dinner, a dessert) to test with.
3. **Titles → links → time and category → a grid → a photo area → whole card clickable.**
4. **Two cards per row on phones**, to cut down on scrolling.
5. **`RecipeCard` became a component** once the `<li>` had grown big, with a `CardPhoto` helper for real photos.
6. **A grid/list toggle**, with the view in state and a `layouts` lookup for the grid classes. The buttons were first written by hand, then made from a list, then given icons.
7. **The category filter**, with chips and `.filter()`, and a message when nothing matches.
8. **Refactor:** `CategoryChips` and `ViewToggle` became their own components; "Alle" became one option in the same list as the categories; the filtering moved to `recipes/filter.ts` (with tests), as one `filters` object. *Why:* the page went from 130 to 80 lines, and the next filter (search) becomes one field and one rule.


## 11. Search, and recipes that don't have to be finished

*After `149adfd`*

**Search** was built as a tutorial first (1.1–1.4: a field, `query` in `filters`, the title, then description and ingredients, then case and spaces), and then finished in one go:
- **Tests** with made-up recipes (`makeRecipe` in `filter.test.ts`), so they don't break when the placeholder recipes are replaced or the CMS arrives.
- **The field:** a magnifying glass, a ✕ to clear it, 16px text (so iPhones don't zoom), a hidden label for screen readers, and messages that name what you searched for.

**Incomplete recipes.** The goal is to post a recipe quickly from the phone (maybe just a title and a photo) and fill it in later. Decided: **only the title is required.**
- `types.ts`: everything except `id`, `title`, `createdAt` and the lists is optional. The lists may be empty.
- `isIncomplete(recipe)` (no ingredients yet) gives an "Uferdig" label on the card and a note on the recipe page. *Why calculated:* it can never be out of date.
- Every part of the site only shows what's there: the card line, the time/portion line, the portion selector, "Slik gjør du", and the ingredient panel. Without ingredients the recipe page is one column.
- `data.test.ts` now checks that every recipe has a title, and only checks numbers that are filled in.
- **Fixed along the way:** on a short recipe, the panel colour leaked out under the main column on desktop.

## 12. "Hva med…?": a suggestion that suits the day

*Commits `f1063ae` and `7dad61a`*

Built as a tutorial (2.1–2.11): first a random recipe with `Math.random()`, then in state with a "Vis et annet forslag" button, never the same twice in a row, only complete recipes, only dinners.
- **The rules moved into a pure function**, `pickSuggestion(recipes, day, current)` in `recipes/suggest.ts`, with tests. *Why:* the page only shows the result, and the tests can "pretend it's Saturday" because the page passes in the weekday instead of the function reading the clock.
- **`occasions` ("Ukedag", "Helgemat")** became its own field, not a tag, since it's only used to pick the suggestion and is never shown. Missing means "Ukedag" (`occasionsOf`), so only weekend food needs marking.
- **Fallbacks:** if nothing suits the day, any dinner, then any complete recipe. The suggestion never disappears just because a rule is too strict.
- **Fridays are pizza day:** "Pizzatid!" with a link to the calculator.

## 13. The filter panel, modelled on Matprat

*Commits `ac6e794` → `84d6a18`, and the work after*

**Built step by step first (3.1–3.5),** to see what a filter needs:
1. `ingredientNames(recipes)`: every ingredient name once, cleaned, sorted the Norwegian way (`flatMap`, `Set`, `localeCompare(…, "nb")`).
2. **Main ingredient by hand:** a `proteins` field in `RecipeFilters` and one more rule in `filterRecipes`.
3. **Refactor: the filters became a list, `filterGroups`.** Each group is an object with what *differs* (id, label, options, a `matches` rule for one option); what's the *same* ("nothing ticked = no filter", "and" between groups) is written once in `filterRecipes`. *Why:* the next filters became one entry each, and `filterRecipes` didn't change when they were added. The old tests stayed the same and kept passing; that was the safety net.
4. **Ingredients and properties** as entries, with `combine: "any" | "all"`. Properties became "all" after a question: a guest who can't have gluten *or* lactose needs recipes that are *both* free.
5. `cleanName` in one place, so the options and the rule that checks them always clean names the same way.

**Then built in one go** (the user wasn't interested in the filter logic, only in the result): `toggleOption`, the counts (`countWithOption`), the button, the `<dialog>` panel, and the chips above the cards.

**Then made more like Matprat**, after looking at their filter:
- **Several meals at once.** The category became a filter group like the others; the chips are a shortcut to it.
- **New groups:** Tid (worked out from `minutes`, nothing to fill in), Vanskelighetsgrad, Kjøkken (a flat list, "Fusion" for mixes), "Passer til" (Sunn, Kos, Gjester, Barnevennlig, Tradisjon, Høytid, Matpakke og tur), and **Uten ingredienser** (`combine: "none"`). Barnevennlig moved from the tags to "Passer til"; the tags are now only diet needs ("Tilpasninger").
- **Not every recipe is filled in, and that's fine.** Each group has `hasInfo`: a recipe without the information is hidden only while that group is in use. **The Datasjekk** (`/oppskrifter/datasjekk`, `recipes/completeness.ts`) lists what each recipe is missing, so it's easy to fill in, now and later in a CMS.
- Sections that open and close, an icon-only button on phones, and a shorter placeholder in the search.

**Styling (as a tutorial, then finished):** a sheet from the bottom on phones (`mt-auto` on the dialog, `min-h-0` on the scroll area), sliding in and out (`starting:` and `transition-discrete`, off for "reduce motion"), a ✓ on ticked options, and focus rings.

**Checked** at 360px and on desktop, with the keyboard: Tab stays in the panel, Enter/Space work, Esc closes it and puts focus back on the button.

## 14. Tidying up after task 3

A refactor before the next tasks, so the code is easy to come back to. Nothing changed for the user (checked with the same browser checks as above).
- **`FilterPanel.tsx` was split.** The panel (button, dialog, heading, bottom bar) stayed; one group's section (heading, options, "Vis alle") moved to `FilterGroupSection.tsx`. The long class string on the dialog became a commented list (`panelClasses`). *Why:* the file was 340 lines doing two jobs.
- **"Which options are used most"** moved out of the component into `mostUsedOptions` in `recipes/filter.ts`, with tests. *Why:* logic belongs with the other filter logic, where it can be tested and survives a CMS.
- **`SearchField`** became its own component, and the "nothing matches" message a small function (`noResultsText`). *Why:* `RecipeListPage` now reads as an outline of the page (227 → 177 lines).
- **Shared icons** (`components/icons.tsx`: ✕, ✓, chevron, filter, search) and **one `focusRing`** (`components/focusRing.ts`). *Why:* the same ✕ was drawn in four places.
- **One `makeRecipe`** for the tests (`recipes/testRecipe.ts`), instead of a copy in three test files.
- **Prettier** was added (`npm run format`, Prettier's default settings) and every file in `src/` formatted once. *Why:* the files were formatted in slightly different ways; now there's one style, and nobody has to think about it. Only line breaks changed.

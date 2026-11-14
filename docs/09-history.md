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

## 15. A CMS-ready data layer (task 4)

*Built in one go (the user wasn't interested in coding the data plumbing), with tests and browser checks.*
- **The border, `toRecipe(raw)`** (`recipes/toRecipe.ts`): takes `unknown` and gives a real `Recipe`. Only a missing id or title makes a recipe unreadable; anything else wrong is left out, as if not filled in, so the Datasjekk asks for it. Unreadable recipes and doubled ids are skipped, named in the console and on the Datasjekk. *Why:* TypeScript can't check data that arrives while the site runs. `data.test.ts` checks that every recipe in `data.ts` goes through unchanged, so a new field can't be forgotten in `toRecipe`.
- **A data layer that waits:** `getAllRecipes()`, `getRecipe(id)` and `getSkippedRecipes()` return a `Promise`, with a pretend delay (and a pretend failure switch) while developing. *Why:* a CMS takes time and can fail; now only `fetchRecipes` changes when it comes.
- **React Router loaders:** `createBrowserRouter` in `main.tsx`, the routes as a list in `routes.tsx`, the loaders in `loaders.ts`, and the pages read with `useLoaderData()`. `App` became the frame with `<Outlet />`. *Why:* the page is only shown when its data is there, so the pages don't need their own "not loaded yet" code.
- **"Laster…"** (`useNavigation`, fades in after a moment so quick loads don't flicker), `LoadingPage` on the first load, and **`RouteErrorPage`** with "Prøv igjen" (`useRevalidator`). Plus `<ScrollRestoration />`: a new page starts at the top, back returns to where you were.
- **"Like ingrediensnavn" on the Datasjekk:** `similarIngredientNames` in `completeness.ts` finds names that are the same without a Norwegian ending (tomat/tomater) or one letter apart (5+ letters).


## 16. A friendlier Studio

*Built as a tutorial, the code typed by Claude after each idea was explained. Only `studio/` changed; the data, the GROQ query and the site are the same.*
- **Tabs (`groups`)** on the recipe form: **Raskt** (title, address, photo; `default: true`, so the form opens there, for quick posting from the phone), Detaljer, Ingredienser and Fremgangsmåte. Porsjoner is on two tabs (`group: ['detaljer', 'ingredienser']`): one field, shown twice. *Why:* on the phone you no longer scroll past 17 fields to post a photo. The address is on Raskt because it's required, and a required field on a hidden tab would block Publish.
- **Placeholders, not starting values,** on Porsjoner and Tid (`placeholder: 'f.eks. 4'`). *Why:* an `initialValue` is real data, so "4 porsjoner" on a photo-only recipe would hide from the Datasjekk that nobody decided it. A placeholder is only a hint and is never saved. Every field was checked against that rule, and none got a plain starting value.
- **Templates on the "+" button** (`schema.templates` in `sanity.config.ts`): "Ny middag" and "Ny dessert" start with the meal type filled in, and plain "Oppskrift" is kept (`...prev`). *Why:* choosing the template *is* the decision, so the value isn't a guess.
- **Own lists in the left column** (`studio/structure.ts`, the Structure tool): Alle oppskrifter, Uferdige (no ingredients, the same rule as `isIncomplete`) and Mangler bilde. Each list is a GROQ filter, so nothing extra is stored and a recipe leaves the list by itself.
- **Deployed** with `npx sanity deploy`: the phone uses a built copy of the Studio, so every change in `studio/` needs a new deploy to reach it.

## 17. Ingredient names to pick from

*Built as a tutorial, the code typed by Claude after each idea. Only `studio/` changed.*
- **An own input component** on the ingredient's name (`components: {input: IngredientNameInput}` in `ingredient.ts`, the component in `studio/components/IngredientNameInput.tsx`). Started as a wrapper around Sanity's own input (`renderDefault`), then replaced by Sanity UI's `Autocomplete` (imported from `@sanity/ui/autocomplete` in Sanity UI 4; `@sanity/ui` is now in the Studio's `package.json`).
- **The names come from GROQ inside the Studio:** `useClient` (logged in as you, so drafts count too, and no token in the code) and `array::unique(*[_type == "recipe"].ingredients[].name)`, fetched once in a `useEffect`.
- **A clean list:** no `null`/empty names, cleaned with the site's own `cleanName` (imported from `src/recipes/filter.ts`, so "Kesam" and "kesam" are one), each name once (`Set`), sorted the Norwegian way.
- **Suggestions, not a closed list:** typing saves the text as it is (`onQueryChange`), choosing a suggestion saves that name; the input passes on Sanity's `elementProps` so the label, validation and focus still work, and saves with patches (`set` / `unset`).
- **Why not ingredients as their own documents:** slower on the phone, and every recipe would need converting. Only worth it if ingredients get their own data (nutrition, a shopping list).

## 18. The overview remembers the view, and "Store"

*Built as a tutorial, the code typed by Claude after each idea.*
- **The view is remembered** in `localStorage` (`components/recipe/recipeView.ts`, with tests). First plainly, with an `as` cast, to see it work; then made safe, because `localStorage` is outside the code like Sanity: `recipeViews` is a real list with the type made from it, `.find` checks the saved text without `as`, and `try`/`catch` handles a browser that blocks storage. *Why not in the address, like the filters:* the filters are *what* you look at (a shared link should bring them); the view is *how you like to look* (a preference, per browser).
- **"Store" (`large`)**: big cards, 1/2/3 per row. Adding `"large"` to `recipeViews` made TypeScript point at `layouts` (`Record<RecipeView, string>`); the button in `ViewToggle` had to be remembered. The page picks the card with a second lookup, `cardVariants`, instead of a chain of `? :`.
- **Sharp photos in the big cards:** `RecipeCard` got a `"large"` variant with its own `sizes`, matching the grid, since the browser picks a photo before it knows the layout. Checked in a browser: a big card on a phone fetches `w=1280`, a standard one `w=640`.

## 19. Pasting a whole ingredient list

*Step 1 (wrapping the list) shown as a tutorial; the rest coded by Claude on request.*
- **Wrap, not replace:** an own input on the `ingredients` array (`components: {input: IngredientListInput}` in `recipe.ts`). It draws Sanity's own list with `props.renderDefault(props)` (add, drag, delete, edit still work) and adds a «Lim inn liste» box under it. *Why:* unlike the name input, the list does a lot we want to keep. Props type: `ArrayOfObjectsInputProps`. (Sanity UI 4: `Stack` takes `gap`, not `space`.)
- **The reading is a pure function in `src/recipes/parseIngredients.ts`** (`parseIngredientLine`, `parseIngredientList`, with tests), like `cleanName`: no Sanity in it, so a future `/ny-oppskrift` form can use it too. Rules: amount (decimal comma, `½`, `1 ½`, `1/2`) → a known unit → the **first comma** splits name and note (`Løk, finhakket`), a bracket moves to the note, names through `cleanName`, bullets removed, `Til sausen:` = group for the lines after.
- **Never invent a number:** a range (`2-3 fedd`), a word amount (`en klype`) or `0` leaves the whole line as the name, to fix by hand. A wrong amount is easy to miss; a messy name shows up (and "Like ingrediensnavn" catches some).
- **Adding the lines with patches:** each line gets `_type: 'ingredient'` and its own `_key`, then `setIfMissing([])` + `insert(items, 'after', [-1])`: added at the end, nothing replaced. The box empties afterwards, so a second click can't add the lines twice.
- Not done: splitting on ` / ` on one line, and number words ("en", "to").

## 20. The Datasjekk in the Studio

*Coded by Claude on request.*
- **«Datasjekk» in the Studio's left column** (`studio/dataCheck.ts`, added in `structure.ts`): one line per check with a count ("Mangler bilde (1)"), and «Like ingrediensnavn» with the name pairs. Clicking a line opens a normal Studio list of those recipes.
- **The site's rules, not GROQ copies:** the recipes are fetched with the site's own fields (`recipeFields`, split out of `recipesQuery` in `src/recipes/sanityQuery.ts`), read with `toRecipe` and checked with `completenessReport` / `similarIngredientNames`. A new check in `completeness.ts` shows up in the Studio by itself. (The older «Uferdige» and «Mangler bilde» lists are GROQ filters, kept as quick shortcuts.)
- **Drafts too, and live:** `context.documentStore.listenQuery(…, {perspective: 'drafts'})` gives each recipe once, in its newest version, and sends the list again when a recipe changes, so the counts update while you fill in. The child of the line is that Observable (`.pipe(map(…))`, `rxjs`, now a direct dependency of the Studio). The id is the document's `_id` (a draft may not have a slug yet), and the lists ask for both `abc` and `drafts.abc`.
- A recipe without a title isn't listed: `toRecipe` can't read it, and the Studio already shows that in red.

## 21. Cuisine and difficulty on the recipe page

*Coded by Claude on request.*
- **The difficulty** in `RecipeMeta`, next to the time and portions, with an icon of four bars filled up to the level (`difficulties.indexOf` in `types.ts`, so the order of the fixed list is the order of the bars). Not a label: it's a fact about the recipe, like the time.
- **The cuisine** as a label (`recipeLabels` in `display.ts`, after the main ingredient, with tests). "Passer til" was already there, as labels after the tags.
- Missing values are left out, like everything else on the page.

## 22. «Husoppskriften» instead of remembered settings

*Coded by Claude on request.*
- **Tried first:** remembering the settings in `localStorage` (task 4), with each saved field checked on its own. Built, tested, and then **dropped**: the default settings *are* the house recipe, which is what's usually baked, so opening on last time's experiment would mean an extra click most times.
- **Instead:** the page always opens with the house recipe (`useState(defaults)`, as before), and a **«Husoppskriften»** button under the subtitle puts it back after trying something else. Only shown when something differs: `isHouseRecipe(settings)` in `pizza/settings.ts` (with tests) compares every field with `Object.is`, so an empty field (NaN) counts as changed too.

## 23. A fuller top on the overview (desktop)

*Coded by Claude on request, after the user found the right side of `/oppskrifter` empty on desktop.*
- **"Hva med…?" on the right** from lg; heading, search and meal chips on the left. A grid with a fixed right column (26rem, 34rem from xl; the chips still fit on one line at 1440px), and the photo 4:3 like the cards below; the suggestion spans the left column's rows, so it's exactly as tall and both sides end at the same line. Phones are unchanged.
- **First try:** a big card with the photo across the top (16:10). It made the right side much taller than the left, with an empty gap under the chips. Changed to the same row as on phones, with a bigger square photo, stretched to the left column's height. (Letting the recipe cards start next to the chips was considered, but the count line, the view buttons and the list view sit in between.)
- **The overview now has the header's width** (`max-w-6xl`, `px-4 md:px-8`) instead of Gladkokken's 1500px, so everything lines up with the logo and the menu. (The recipe page keeps its 1500px layout with the panel to the screen edge.)
- A suggestion without a photo shows the big grey initial; that improves as recipes get photos. Not done: preferring recipes with a photo in `pickSuggestion`.
- **Then, after a look:** no border around the suggestion on desktop (the phone keeps it), the search row as wide as the meal chips (search + chips in one `w-fit` box, so they end at the same place), and **the whole site a bit wider**: `max-w-6xl` → `max-w-7xl` in the header, footer, `Container` and every page that used it, so everything still lines up with the logo and the menu. The recipe page keeps its own 1500px layout.

## 24. The recipe page on phones, like Matprat, and cooking mode

*Coded by Claude on request. The user showed Matprat's recipe page on an iPhone as the model.*
- **The ingredients in the page** on phones, before the steps, with the portions (the same `IngredientsPanel`, `lg:hidden print:block`, which also replaces the old paper-only copy). The bottom bar with the full-screen panel (`MobileIngredients`, section 6 of this history) is removed: with the ingredients in the page, it isn't needed.
- **A section bar under the header** (`RecipeSectionNav`): «Ingredienser · Slik gjør du · Tips», tap to jump, the current part dark. New ideas: the header measures itself (`ResizeObserver`) into a CSS variable, `--header-height`, so the bar can stick right under it; `scroll-mt` so a jump doesn't hide the heading; a small "scroll spy" (which part is under the bars).
- **Cooking mode:** «Behold skjermen på» (`KeepScreenOn`, `useWakeLock`, the Screen Wake Lock API, with cleanup and asking again when the page is visible), and tick off steps by tapping the gold number (✓, the step greys out; state only, not saved). On desktop too. `recipeSections` in `display.ts`, with tests.
- Checked at iPhone 17 size (402×874): the bar sticks under the header, jumps and highlights; the switch turns on; a ticked step greys out. Desktop unchanged.

## 25. The recipe page lined up with the header

*Coded by Claude on request.*
- **The header's width** (`max-w-7xl`) instead of Gladkokken's 1500px, and the header's side padding: the main column `px-4 md:px-8`, the panel `pr-8`. Measured in a browser at 1024, 1440 and 1920px: the title starts exactly under the logo, the ingredient list ends exactly under the menu, no sideways scrolling. The panel colour still reaches the screen edge (the background trick works as long as the container is more than twice the panel's width, which it always is).
- The phone's edge-to-edge parts (the ingredients, the section bar) follow the new padding (`-mx-4 md:-mx-8`).
- **Photo sizes updated** to the narrower layout: the recipe photo (`sizes` 860px from lg) and the overview's big cards (360px from 1280px; the old value assumed the 1500px page).

## 26. Clickable labels on the recipe page

*Coded by Claude on request.*
- `recipeLabels` gives `{ label, group }` instead of only text: the group is the filter group's id (`protein`, `cuisine`, `properties`, `themes`). `filterLink(group, option)` in `filter.ts` builds the overview's address with `filtersToParams`, so it's the same address the filter panel would make (with tests, including that the overview reads it back).
- `LabelList` draws a `Link` for a label with a group (dark on hover). At first "Rask" was plain text: it's 30 minutes or less, and no time range matches that, so a link to "20–40 min" would have shown recipes that aren't quick. **Then (asked by the user): «Rask (inntil 30 min)» became a choice in «Tid»** (`quickOption` in `types.ts`, from the same `quickMinutes` as `isQuick`), first in the group and overlapping the ranges ("or" within the group), and the label links to it (`RecipeLabel.option`). With tests (30 min is quick, 31 isn't).
- Checked in a browser: «Fusion» on Laksewrap → `/oppskrifter?kjokken=Fusion`, one recipe, the «Fusion ×» chip.

## 27. Sorting on the overview

*Coded by Claude on request.*
- **`recipes/sort.ts`** (with tests): `sortOptions` as a real list with the type made from it (like the views), `sortRecipes(recipes, order)` returns a new, sorted list (stable, so equal recipes keep their order; recipes without a time last on Raskest), and `sortFromParams` ignores unknown values.
- **In the address, like the filters** (`?sortering=raskest`; nothing for Nyeste), since the order is part of *what* you look at and belongs in a shared link. The page writes filters and order together (`writeAddress`), so ticking a filter keeps the order and choosing an order keeps the filters.
- **`SortSelect`:** the browser's own `<select>`. On phones the word "Sorter" is screen-reader only, so «3 oppskrifter», the list and the view buttons fit on one line at 402px.
- Checked in a browser: each order, a meal chip keeps the order, reload and back keep it, no sideways scrolling on the phone.

## 28. The API on Vercel (task 5a)

*A tutorial, 13–14 November: written by you (`api/hello.ts`, `_sanity.ts`, the lock in `_auth.ts`, `photo.ts`) and by Claude on request (`tsconfig.api.json`, `_slug.ts`, `POST` and `PATCH` in `recipes.ts`, `_changes.ts`, `scripts/check-api.mjs`).*

The first part of "post and edit recipes from the site": **server functions** that write to Sanity, so the admin mode (5c) and maybe an app one day can use them. The Studio keeps working as before.

**The files**

| File | What it does |
|---|---|
| `api/recipes.ts` | `POST /api/recipes` `{ "title": "…" }`: creates a **published** recipe (201). `PATCH /api/recipes?slug=…`: changes only the fields sent (200) |
| `api/photo.ts` | `POST /api/photo?slug=…`, with the photo's bytes as the body: uploads it (an *asset*) and points the recipe's `image` to it |
| `api/_sanity.ts` | The server's own Sanity client, with the **write token**, `useCdn: false`. Also `findRecipeId(slug)`, used by `PATCH` and the photo |
| `api/_auth.ts` | The lock: `Authorization: Bearer <POST_SECRET>`, compared with `timingSafeEqual`. No `POST_SECRET` set = nobody gets in ("fail closed") |
| `api/_slug.ts` | `toSlug` (the same as the Studio: `havregrot-med-baer`) and `nextFreeSlug` (`laksewrap-2`). Pure, with tests |
| `api/_changes.ts` | `readChanges`: the **allow-list** of fields `PATCH` may change, and a check for each. Pure, with tests |
| `scripts/check-api.mjs` | `npm run test:api`: 34 checks against the running API, then deletes what it made |
| `tsconfig.api.json` | TypeScript settings for `api/`: Node (`process`, no `window`), and `nodenext`, so imports need `.js` |

Files in `api/` starting with `_` are helpers, not addresses.

**Why it's built this way**
- **The token lives only on the server.** It's in `.env.local` (never committed) and in Vercel's Environment Variables (Production only, *Sensitive*). Never with a `VITE_` name, because Vite copies those into the browser code. Only `api/` uses it. After a build, `dist/` was searched for both secrets: not there.
- **The lock is checked first**, before the body is read or Sanity is asked, so someone without the password learns nothing. It's a stand-in for the login (5b), which will send a *Bearer* too.
- **An allow-list, not a block-list.** `PATCH` only accepts the fields in `editable`; anything else is a 400 (`Kan ikke endre «slug»`). Looked up with `Object.hasOwn`, because every object "has" built-in names like `constructor`. Wrong values are refused, not saved half-right; empty steps are left out.
- **The fixed lists come from `src/recipes/types.ts`**, like the site and the Studio. Node can only load it because `types.ts` imports nothing itself (Vite fills in file endings; Node doesn't).
- **The slug is the id** (what the site knows), and **never changes**, so links keep working. A taken address gets `-2`, `-3` …; drafts' addresses count as taken too (`perspective: "raw"`).
- **Ingredient lines get `_type: "ingredient"` and a random `_key`**, as the Studio adds them. Without a key, the Studio shows «Missing keys».
- **Recipes are published at once**, like a post from the phone: «Uferdig» until they have ingredients.
- **Status codes that explain:** 201 created, 400 your request is wrong (with a message), 401 no access, 404 no such recipe, 405 wrong method, 500 the server failed.

**Things we ran into (and the fixes)**
- **`vercel dev` sent Vite's own files to `index.html`** ("Failed to parse source for import analysis"). The rule in `vercel.json` now only catches page addresses: `/((?!api/|@)[^.]*)`, so not `/api/…`, not Vite's `/@…`, and nothing with a dot.
- **An old, global Vercel CLI crashed on TypeScript 7** (`ts.sys.fileExists`, a 502). Fixed with `npm install -g vercel@latest`.
- **`vercel dev` reads `.env`, not `.env.local`.** So `_sanity.ts` loads `.env.local` itself (`process.loadEnvFile`) if the file exists. Online it doesn't, and Vercel gives the values instead.
- **Online, the functions don't read the committed `.env` either**, so `VITE_SANITY_PROJECT_ID` and `VITE_SANITY_DATASET` are on Vercel too.
- **curl sends `Expect: 100-continue` with big files**, which `vercel dev` can't handle (a 500). Add `-H "Expect:"` when sending a photo to `vercel dev`. Browsers never send it, and Vercel online is fine.
- **`.env` files must have no spaces around `=`**, or `source .env.local` fails ("command not found").

**Limits to know about**
- Vercel takes **at most about 4.5 MB** in a request, so the form (5c) must shrink phone photos before sending.
- An old photo isn't deleted when it's replaced; it stays unused in Sanity's media library.
- `PATCH` changes the **published** recipe. An unpublished draft of the same recipe in the Studio doesn't see the change, and publishing it later would overwrite it.

**Testing:** `npm test` (the pure rules), and `npm run test:api` with `vercel dev` running, or `API_URL=https://<the site> npm run test:api` online. Each run uses its own titles («API-test m3k9x2») and deletes its recipes and photos at the end.

## 29. The login (task 5b)

*A tutorial, 14 November: written by you (the Firebase project, the first `LoginPage`, `adminFetch.ts` and the test button, the settings on Vercel) and by Claude on request (`firebase.ts`, `useUser.ts`, the final `LoginPage`, the new lock in `_auth.ts`, the clean-up).*

Until now, the API's lock was one password (`POST_SECRET`). That's fine for curl, but a password can't be put in the site's code: anyone can read what the browser downloads. So the site needed a real login: prove who you are once, get a pass that expires, and let the server check the pass.

**Choosing a login service**

| Option | Why not / why |
|---|---|
| Clerk | The nicest fit for React, but running it for real needs your own domain, not `*.vercel.app` |
| Supabase Auth | Free projects are **paused after about a week** without use, login included |
| Home-made (password → cookie) | You own all the security yourself; task 5 said "preferably ready-made" |
| **Firebase Auth, with Google** ✅ | Ready-made, free (Spark plan, no card), never paused, works on `*.vercel.app` |

**The files**

| File | What it does |
|---|---|
| `src/auth/firebase.ts` | The connection to Firebase (`initializeApp`, `getAuth`), set up once, like `sanityClient.ts`. The values come from `.env` (`VITE_FIREBASE_…`) and aren't secret: they only name the project |
| `src/auth/useUser.ts` | A hook: who is logged in. `undefined` = not known yet («Sjekker …»), `null` = nobody, a `User` = you |
| `src/auth/adminFetch.ts` | Like `fetch`, but adds `Authorization: Bearer <your ID token>`. The admin mode (5c) uses it for every call to the API |
| `src/pages/LoginPage.tsx` | `/logg-inn`, not in the menu: «Logg inn med Google», then your name, user id and «Logg ut» |
| `api/_auth.ts` | The lock: lets in your Firebase login (`ADMIN_UID`) **or** the script key (`POST_SECRET`) |

**How it works**
- **Logging in:** `signInWithPopup(auth, googleLogin)` opens Google's own window. Your password is typed at Google, never on the site. Firebase remembers the login in the browser (IndexedDB), so it survives a reload.
- **Listening, not asking once:** `onAuthStateChanged` calls back at the start and on every log in or log out. It runs inside `useEffect`, and what it returns stops the listening when the component disappears. `logIn` and `logOut` never set the state themselves; the listener does.
- **Three states, not two:** checking the saved login takes a moment. Starting at `null` would flash the login button before you're recognised. `user === undefined` is checked first, because `undefined` is "false" too.
- **The token is a JWT:** `header.payload.signature`. Anyone can read it, but no one can change it without breaking Google's signature. Google signs with a private key and publishes the public keys; the server checks with those (`jwtVerify` from `jose`, which also keeps the keys so it doesn't fetch them every time). No Firebase package on the server.
- **Four checks on the server:** the signature is Google's, it's for our project (`aud` and `iss` with `VITE_FIREBASE_PROJECT_ID`), it hasn't expired (one hour), and **`sub` is `ADMIN_UID`**. Anyone with a Google account can log in to Firebase, but only you get past the last check.
- **`getIdToken()` every time:** it gives the saved token while it's fresh, and quietly fetches a new one when it's about to expire.
- **`POST_SECRET` stays** as the key for scripts, so `npm run test:api` works without a login.

**Things we ran into**
- **The `await` trap:** checking a token is `async`, so `isAllowed` now returns a `Promise<boolean>`. A Promise is an object, and an object is always "true": without `await`, `!isAllowed(request)` is always `false`, and the lock lets everyone in. All three places are now `if (!(await isAllowed(request)))`. **TypeScript doesn't save you here:** it warns about `if (isAllowed(request))` ("always return true"), but not with `!` in front (checked). So `npm run test:api` has to show `401` for a wrong password after any change to the lock.
- **The Google panel in Firebase** asks about SHA-1 fingerprints and client ids: those are for Android apps and other projects, not for us. Only «Enable» and the support email matter.
- **Firebase's setup code** puts the values in the code; we put them in `.env`, and only three are needed (`apiKey`, `authDomain`, `projectId`).
- **Online, the functions don't read `.env`** (as in 5a), so `ADMIN_UID` and `VITE_FIREBASE_PROJECT_ID` are in Vercel's Environment Variables, and the site's address is under Authorized domains in Firebase.

**Limits to know about**
- **The site's code got bigger** (about 610 kB, 190 kB compressed), because Firebase is loaded on every page. Issue 18 in [08](08-status.md); to be fixed in 5c.
- Only one admin. Another person would need their user id added to the check.

**Testing:** locally with `vercel dev` (port 3000), online on the site: log in at `/logg-inn`; a temporary «Test API» button sent `PATCH` to a recipe that doesn't exist and got `404` (through the lock) instead of `401`. `npm run test:api` still passes with the script key, locally and online.

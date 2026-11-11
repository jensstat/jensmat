# 10 – Tasks

The to-do list. **Tick things off (`- [x]`) as you go, and move the "Now" marker down.**
Known bugs and quirks are in [08 – Status](08-status.md); this file is about what to *build* next.

*Last updated: 11 November 2026. Tasks 1–3 on the overview (search, "Hva med…?", the filter panel) are done. Next up is 4, a CMS-ready data layer, then 5, the filters in the address.*

---

## Starting a new working session

Start each new task in a fresh Claude Code session (`/clear`): it's cheaper, and nothing old gets in the way. Paste an opening line like this:

> We're working on **[the task]**. Read `docs/10-tasks.md` and the files it mentions. I want to build it myself as a **tutorial**: one small change per message, shown in full, then "save and look", and wait for me before the next step. **Teach me the ideas behind the code**, not just the code.

For the next task, for example:

> We're working on **a CMS-ready data layer** (task 4 in `docs/10-tasks.md`). Read `docs/03-recipes.md` sections 2 and 3, `docs/06-react-and-typescript.md` (React Router), `src/recipes/types.ts`, `src/recipes/recipes.ts`, `src/recipes/data.ts`, `src/recipes/data.test.ts`, `src/main.tsx`, `src/App.tsx` and the three pages that read recipes (`RecipeListPage`, `RecipePage`, `DataCheckPage`). Tutorial, one small step per message, and teach me the ideas behind the code. Start with step 4.1.

If you're not interested in a part, say so ("just build this part"), and ask for a tutorial again for the next.

**Keep in mind for every task:**
- The recipes will later come from a **CMS**, posted from a phone app. So logic works on the `Recipe` type, never on where the data comes from.
- **Only the title is required.** Any feature must work for a recipe that has nothing but a title (like "Fiskesuppe" in `data.ts`).
- **Missing information is normal.** A new field on the recipe is optional, gets `hasInfo` if it's a filter group, and a line in the Datasjekk (`recipes/completeness.ts`), so you can see which recipes lack it.
- **Checking the code:** the AI's sandbox can't run your Mac's `node_modules`. It can make its own Linux copy in its scratchpad to run the checks, or ask you to run `npm test` and `npm run build`.

**Before you `/clear`:** `npm run format`, commit, and tick off what's done here.

---

## ▶ Now: the recipe overview (task 4 next, then 5)

**Done** (what was built, and why, is in [09 – History](09-history.md), sections 11–14):
- ✅ **1. Search** in the title, the description and the ingredients
- ✅ **2. "Hva med…?"**: a complete dinner that suits the day (Ukedag/Helgemat), and pizza on Fridays
- ✅ **3. The filter panel**, modelled on Matprat: Måltid, Hovedingrediens, Tid, Vanskelighetsgrad, Kjøkken, Passer til, Tilpasninger, Har/Uten ingredienser, with counts. The meal chips are a shortcut to Måltid. Plus the **Datasjekk** at `/oppskrifter/datasjekk`. How it works: [03](03-recipes.md), section 6

### 4. A CMS-ready data layer

**Why now:** the shape of a recipe is ready for a CMS, but two things would break the day the recipes come from the internet instead of `data.ts`. It's much cheaper to fix them now, while only three pages read recipes, and before task 5 builds on how the pages get their data.

1. **Nothing checks the data at the border.** TypeScript only checks the code, not data that arrives while the site runs, and `data.test.ts` only checks `data.ts`. A recipe from a CMS without an `ingredients` list would crash the page on `.map()`.
2. **The data layer answers instantly; a CMS doesn't.** `getAllRecipes()` returns at once. Fetching takes time and can fail, so the pages need "loading" and "couldn't load" states, and "Hva med…?" must pick from recipes that have arrived.

Plus one thing for typing recipes on a phone: **ingredient names that are almost the same** ("tomat" / "tomater") become separate filter options.

Suggested tutorial steps:

- [ ] 4.1 **`toRecipe(raw)`**, the translation at the border, in a new `recipes/toRecipe.ts`, with tests. It takes `unknown` (anything) and gives a valid `Recipe`, or `undefined` if there's no id or title. A missing list becomes `[]`; a value that isn't in its fixed list (a category "Midag", a cuisine that doesn't exist) is left out; a number that isn't a number is left out; the title is trimmed. *The idea:* `unknown`, and checking data while the site runs (`typeof`, `.includes` on the fixed lists)
- [ ] 4.2 **`data.ts` goes through the border too.** `recipes.ts` runs every recipe through `toRecipe`, so today's data takes the same path as CMS data will. A recipe that can't be read is skipped and named in the browser console (and listed on the Datasjekk), never crashing the page
- [ ] 4.3 **A data layer that waits.** `getAllRecipes()` and `getRecipe(id)` return a `Promise`, still reading `data.ts` (with a short pretend delay while testing, to see the loading). *The idea:* `Promise`, `async`/`await`
- [ ] 4.4 **React Router loads the data before showing the page.** `main.tsx` switches from `<BrowserRouter>` to `createBrowserRouter`, and `/oppskrifter`, `/oppskrifter/:id` and `/oppskrifter/datasjekk` each get a `loader`. The pages read it with `useLoaderData()`. An unknown recipe id still shows "Fant ikke siden". "Hva med…?" picks from the loaded recipes
- [ ] 4.5 **Loading and error states.** A calm "Laster…" while a page waits (`useNavigation`), and "Kunne ikke hente oppskriftene" with a "Prøv igjen" button when it fails (`errorElement`). Test by making the pretend fetch fail on purpose
- [ ] 4.6 **Similar ingredient names on the Datasjekk**: `similarIngredientNames(recipes)` in `completeness.ts`, with tests. Names that are the same apart from a Norwegian plural ending ("tomat"/"tomater", "paprika"/"paprikaer") or one letter ("hvitlauk"/"hvitløk"), shown with the recipes that use each, so they're easy to make the same
- [ ] 4.7 Check: `npm test`, every page on the phone and desktop, a slow connection (the browser's dev tools can pretend to be on a slow network), and the error state

### 5. The filters in the address

Store the search and every filter in the address (`/oppskrifter?sok=laks&maltid=middag&tid=20–40+min`), so reload and the back button keep them, and a filtered list can be shared as a link. Today they're `useState` in `RecipeListPage`, so a reload clears them. Suggested tutorial steps:

- [ ] 5.1 Only the search, first: read and write `?sok=` with React Router's `useSearchParams`. The address *is* the state now. Reload keeps the text
- [ ] 5.2 Two pure functions in `recipes/filter.ts`: `filtersToParams(filters)` and `filtersFromParams(params)`, with tests (there and back again gives the same filters). Each filter group gets a Norwegian name for the address: a new `param` field in `FilterGroup` (`"maltid"`, `"hovedingrediens"`, `"tid"` …), since the `id`s are English
- [ ] 5.3 The page reads its filters from the address instead of `useState`, and every change writes the address. While typing, replace the address instead of adding to the history, so the back button isn't full of single letters
- [ ] 5.4 Unknown or old values in an address are ignored, so a link with `?kjokken=marsiansk` doesn't break anything. With tests
- [ ] 5.5 Check: reload, the back button, a shared link, and on the phone

**Maybe later on the overview:**
- [ ] The third view, "Store" (big cards, 1 per row on phones)
- [ ] Remember the chosen view with `localStorage`
- [ ] Show cuisine, difficulty and "Passer til" on the recipe page (the labels already show the themes)

---

## Next: small fixes (about 15 minutes)

From [08 – Status](08-status.md):

- [ ] The browser tab says "mat-nettside" → change the `<title>` in `index.html`
- [ ] One name for the site: the logo, footer and front page say different things
- [ ] Remove the leftover `bg-gray-50` in `App.tsx`
- [ ] A tidier printout of recipes (`print:hidden` on the header, menu and actions)

---

## Then: real content

- [ ] Replace the placeholder recipes (Havregrøt, Lasagne, Sjokolademousse, and Fiskesuppe, the incomplete example) with your own
- [ ] Add more of your own recipes. `npm test` checks each one
- [ ] Photos in `public/images/recipes/`, under ~300 KB each

---

## Later: online

- [ ] Publish the site (Netlify, Vercel or GitHub Pages). Remember the setting that sends every address to `index.html` (see 08, issue 11)
- [ ] A CMS (for example Sanity) for posting recipes with photos from the phone. See [03](03-recipes.md), "Later: CMS and a phone app". With task 4 done, this is mostly:
  - the CMS's recipe form, built from the same fixed lists as `types.ts` (Sanity's forms are written in code and can import them), so the lists live in one place
  - `recipes.ts` fetches from the CMS and runs each recipe through `toRecipe`; nothing else in the site changes
  - an `imageUrl(recipe, width)` helper, so the cards get small photos and the recipe page a large one (CMS image services resize on request)
  - the Datasjekk's list shown in the CMS as warnings ("mangler kjøkken"), and a list of existing ingredient names to pick from, so the names stay the same

---

## Ideas (no order)

**Front page**
- [ ] "Nyeste oppskrifter": the newest recipes, reusing `RecipeCard`
- [ ] "Hva skal vi spise i dag?": a random recipe

**Pizza calculator**
- [ ] Remember the settings when the page is reloaded (`localStorage`)
- [ ] Share settings as a link
- [ ] Test-bake "Forum-basert" vs "Hjemmeoppskrift", and adjust
- [ ] The 48 h+ yeast chart (forum reply #406)
- [ ] Sourdough, with its own calculation (hidden for now)

**Code tidy-up**
- [ ] Move `SelectOption` and `ResultRow` out of the components (08, issue 6)
- [ ] Use `Container` on more pages (08, issue 7)

**Phone**
- [ ] A tab bar at the bottom of the screen (fits with a phone app)

---

## Done ✅

- [x] Pizza calculator: settings, pizza types, grams, yeast from the forum chart, method with clock times, fridge rises, tests
- [x] Routing (React Router) and a working menu
- [x] Front page: heading, subtitle and two buttons
- [x] Recipe data model, data layer and example data
- [x] Recipe page in Gladkokken's style: ingredient panel, portions, groups, phone menu, print and copy link
- [x] Text size tuned (90 % on large screens)
- [x] Documentation in `docs/`
- [x] Recipe overview: cards, grid/list view, category filter, empty state
- [x] Search on the overview: title, description and ingredients, with tests
- [x] Incomplete recipes: only the title is required, an "Uferdig" label, and every page handles missing parts
- [x] Filter panel on the overview (like Matprat): meal type, main ingredient, time, difficulty, cuisine, "Passer til", diet, with/without ingredients, with counts and tests. Datasjekk at `/oppskrifter/datasjekk`
- [x] "Hva med…?" on the overview: a complete dinner that suits the day ("Ukedag"/"Helgemat"), pizza on Fridays, with tests

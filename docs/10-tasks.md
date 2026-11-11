# 10 – Tasks

The to-do list. **Tick things off (`- [x]`) as you go, and move the "Now" marker down.**
Known bugs and quirks are in [08 – Status](08-status.md); this file is about what to *build* next.

*Last updated: 11 November 2026. Tasks 1–3 on the overview (search, "Hva med…?", the filter panel) are done; next up is 4, the filters in the address.*

---

## Starting a new working session

Start each new task in a fresh Claude Code session (`/clear`): it's cheaper, and nothing old gets in the way. Paste an opening line like this:

> We're working on **[the task]**. Read `docs/10-tasks.md` and the files it mentions. I want to build it myself as a **tutorial**: one small change per message, shown in full, then "save and look", and wait for me before the next step. **Teach me the ideas behind the code**, not just the code.

For the next task, for example:

> We're working on **the filters in the address** (task 4 in `docs/10-tasks.md`). Read `docs/03-recipes.md` section 6 (and "How to add a filter group"), `docs/06-react-and-typescript.md` (React Router), `src/recipes/filter.ts`, `src/recipes/filter.test.ts` and `src/pages/RecipeListPage.tsx`. Tutorial, one small step per message, and teach me the ideas behind the code. Start with step 4.1.

If you're not interested in a part, say so ("just build this part"), and ask for a tutorial again for the next.

**Keep in mind for every task:**
- The recipes will later come from a **CMS**, posted from a phone app. So logic works on the `Recipe` type, never on where the data comes from.
- **Only the title is required.** Any feature must work for a recipe that has nothing but a title (like "Fiskesuppe" in `data.ts`).
- **Missing information is normal.** A new field on the recipe is optional, gets `hasInfo` if it's a filter group, and a line in the Datasjekk (`recipes/completeness.ts`), so you can see which recipes lack it.
- **Checking the code:** the AI's sandbox can't run your Mac's `node_modules`. It can make its own Linux copy in its scratchpad to run the checks, or ask you to run `npm test` and `npm run build`.

**Before you `/clear`:** `npm run format`, commit, and tick off what's done here.

---

## ▶ Now: the recipe overview (task 4 next)

**Done** (what was built, and why, is in [09 – History](09-history.md), sections 11–14):
- ✅ **1. Search** in the title, the description and the ingredients
- ✅ **2. "Hva med…?"**: a complete dinner that suits the day (Ukedag/Helgemat), and pizza on Fridays
- ✅ **3. The filter panel**, modelled on Matprat: Måltid, Hovedingrediens, Tid, Vanskelighetsgrad, Kjøkken, Passer til, Tilpasninger, Har/Uten ingredienser, with counts. The meal chips are a shortcut to Måltid. Plus the **Datasjekk** at `/oppskrifter/datasjekk`. How it works: [03](03-recipes.md), section 6

### 4. The filters in the address

Store the search and every filter in the address (`/oppskrifter?sok=laks&maltid=middag&tid=20–40+min`), so reload and the back button keep them, and a filtered list can be shared as a link. Today they're `useState` in `RecipeListPage`, so a reload clears them. Suggested tutorial steps:

- [ ] 4.1 Only the search, first: read and write `?sok=` with React Router's `useSearchParams`. The address *is* the state now. Reload keeps the text
- [ ] 4.2 Two pure functions in `recipes/filter.ts`: `filtersToParams(filters)` and `filtersFromParams(params)`, with tests (there and back again gives the same filters). Each filter group gets a Norwegian name for the address: a new `param` field in `FilterGroup` (`"maltid"`, `"hovedingrediens"`, `"tid"` …), since the `id`s are English
- [ ] 4.3 The page reads its filters from the address instead of `useState`, and every change writes the address. While typing, replace the address instead of adding to the history, so the back button isn't full of single letters
- [ ] 4.4 Unknown or old values in an address are ignored, so a link with `?kjokken=marsiansk` doesn't break anything. With tests
- [ ] 4.5 Check: reload, the back button, a shared link, and on the phone

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
- [ ] A CMS (for example Sanity) for posting recipes with photos from the phone. See [03](03-recipes.md), "Later: CMS and a phone app"

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

# 10 – Tasks

The to-do list. **Tick things off (`- [x]`) as you go, and move the "Now" marker down.**
Known bugs and quirks are in [08 – Status](08-status.md); this file is about what to *build* next.

*Last updated: 11 November 2026. Search, incomplete recipes and "Hva med…?" are done; next up is 3, more filters.*

---

## Starting a new working session

Start each new task in a fresh Claude Code session (`/clear`): it's cheaper, and nothing old gets in the way. Paste an opening line like this:

> We're working on **[the task]**. Read `docs/10-tasks.md` and the files it mentions. I want to build it myself as a **tutorial**: one small change per message, shown in full, then "save and look", and wait for me before the next step. **Teach me the ideas behind the code**, not just the code.

For "Hva med…?", for example:

> We're working on **"Hva med…?"** (task 2 in `docs/10-tasks.md`). Read `docs/03-recipes.md` sections 2 and 6, `src/pages/RecipeListPage.tsx`, `src/components/recipe/RecipeCard.tsx` and `src/recipes/types.ts`. Tutorial, one small step per message, and teach me the ideas behind the code.

**Keep in mind for every task:**
- The recipes will later come from a **CMS**, posted from a phone app. So logic works on the `Recipe` type, never on where the data comes from.
- **Only the title is required.** Any feature must work for a recipe that has nothing but a title (like "Fiskesuppe" in `data.ts`).
- **Checking the code:** the AI's sandbox can't run your Mac's `node_modules`. It can make its own Linux copy in its scratchpad to run the checks, or ask you to run `npm test` and `npm run build`.

**Before you `/clear`:** commit, and tick off what's done here.

---

## ▶ Now: the recipe overview (task 3 next)

### 1. Search field ✅

Make it possible to search for a recipe by name or ingredient. Builds on the filter that's already there. Suggested tutorial steps:

- [x] 1.1 A plain text field above the chips, with its own state, and the text shown under it (to check it works)
- [x] 1.2 Add `query` to `RecipeFilters` in `recipes/filter.ts`, and a rule in `filterRecipes` that matches the **title**
- [x] 1.3 Also match **ingredient names** and the description ("laks" finds Laksewrap)
- [x] 1.4 Ignore upper/lower case and spaces at the ends (`toLowerCase()`, `trim()`)
- [x] 1.5 A test in `filter.test.ts` for search, and for search + category together
- [x] 1.6 Style the field (search icon, a ✕ to clear it), and let "Vis alle oppskrifter" clear the search too
- [x] 1.7 Phone check: the field and the chips should fit nicely at 360px

### 2. "Hva med…?" – inspiration ✅

A suggestion at the top of the overview: one random dinner that suits the day (easy weekday food, weekend food on Saturdays, pizza on Fridays), big, with a "Vis et annet forslag" (show another) button. Suggested tutorial steps:

- [x] 2.1 Pick one random recipe with `Math.random()` and show its title above the chips (to check it works)
- [x] 2.2 Put the suggestion in state, and a "Vis et annet forslag" button that picks a new one
- [x] 2.3 Never the same recipe twice in a row
- [x] 2.4 Only suggest **complete** recipes (`isIncomplete` in `types.ts`), and show nothing if there are none
- [x] 2.5 Move the picking into a pure function in `recipes/` (like `filterRecipes`), with tests
- [x] 2.6 Only **dinners** (`category === "Middag"`). If there are none, fall back to any complete recipe. With tests
- [x] 2.7 **"Ukedag"** (weekday food) and **"Helgemat"** (weekend food): a new `occasions` field in `types.ts`, not a tag, since it's only for the suggestion and never shown. Missing means "Ukedag" (`occasionsOf`). A dinner can be both. Marked: Laksewrap both, Lasagne and Fiskesuppe "Helgemat"
- [x] 2.8 **The day decides:** the page passes in the weekday (`new Date().getDay()`), so the function stays pure and tests can "pretend it's Saturday". Use `occasionsOf(recipe)`. With tests
  - Monday–Thursday: dinners with "Ukedag"
  - Saturday: dinners with "Helgemat" (also those that have "Ukedag" too)
  - Sunday: dinners with "Helgemat" or "Ukedag"
  - If nothing fits: any dinner, then any complete recipe. The suggestion should never disappear just because a rule is too strict
- [x] 2.9 **Friday is pizza day:** "Pizzatid!" with a link to the pizza calculator (`/pizza`) instead of a recipe, and no "Vis et annet forslag" button
- [x] 2.10 Style it: a big photo (or the placeholder letter), the title, the card line, linked to the recipe. And a nice Friday version
- [x] 2.11 Phone check at 360px, the Friday version too (nothing sticks out; tapping the box opens the recipe or the calculator, and the button doesn't)

### 3. More filters

- [ ] "Rask" (≤ 30 min) as a chip. `isQuick` already exists
- [ ] Main ingredient (Kylling, Fisk, Vegetar …). The `proteins` list already exists
- [ ] *(Maybe)* the third view, "Store" (big cards, 1 per row on phones)
- [ ] *(Maybe)* remember the chosen view with `localStorage`

### 4. The filters in the address

- [ ] Store category and search in the address (`/oppskrifter?kategori=middag&sok=laks`), so the back button and links keep them

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
- [x] "Hva med…?" on the overview: a complete dinner that suits the day ("Ukedag"/"Helgemat"), pizza on Fridays, with tests

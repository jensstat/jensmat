# 10 – Tasks

The to-do list. **Tick things off (`- [x]`) as you go, and move the "Now" marker down.**
Known bugs and quirks are in [08 – Status](08-status.md); this file is about what to *build* next.

*Last updated: 10 November 2026.*

---

## Starting a new working session

Start each new task in a fresh Claude Code session (`/clear`): it's cheaper, and nothing old gets in the way. Paste an opening line like this:

> We're working on **[the task]**. Read `docs/10-tasks.md` and the files it mentions. I want to build it myself as a **tutorial**: one small change per message, shown in full, then "save and look", and wait for me before the next step.

For the search field, for example:

> We're working on **the search field on the recipe overview** (task 1 in `docs/10-tasks.md`). Read `docs/03-recipes.md` section 6, `src/pages/RecipeListPage.tsx` and `src/recipes/filter.ts`. Tutorial, one small step per message.

**Before you `/clear`:** commit, and tick off what's done here.

---

## ▶ Now: the recipe overview

### 1. Search field

Make it possible to search for a recipe by name or ingredient. Builds on the filter that's already there. Suggested tutorial steps:

- [ ] 1.1 A plain text field above the chips, with its own state, and the text shown under it (to check it works)
- [ ] 1.2 Add `query` to `RecipeFilters` in `recipes/filter.ts`, and a rule in `filterRecipes` that matches the **title**
- [ ] 1.3 Also match **ingredient names** and the description ("laks" finds Laksewrap)
- [ ] 1.4 Ignore upper/lower case and spaces at the ends (`toLowerCase()`, `trim()`)
- [ ] 1.5 A test in `filter.test.ts` for search, and for search + category together
- [ ] 1.6 Style the field (search icon, a ✕ to clear it), and let "Vis alle oppskrifter" clear the search too
- [ ] 1.7 Phone check: the field and the chips should fit nicely at 360px

### 2. "Hva med…?" – inspiration

- [ ] A suggestion at the top of the overview: one random recipe with a big photo, and a "Vis et annet forslag" (show another) button
- [ ] Make sure it doesn't suggest the same recipe twice in a row

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

- [ ] Replace the three placeholder recipes (Havregrøt, Lasagne, Sjokolademousse) with your own
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

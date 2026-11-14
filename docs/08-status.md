# 08 – Status

Where the project stands: what works, what's missing, and known issues. **Update this file when something changes.**

*Last checked: 14 November 2026. Type check, lint, 276 tests and the build all pass (the Studio's type check and build too). The recipes come from Sanity, and the site is online (Vercel), now with its own API (`api/`) and a login (`/logg-inn`, Google via Firebase): `npm run test:api` passes all 34 checks locally and online, and the login gets through the API's lock online. Every page was checked in the browser at phone and desktop width: no errors, no sideways scrolling. The filter panel was also checked with the keyboard.*

**What to do next is in [10 – Tasks](10-tasks.md).** This file is about what works and what's known to be wrong.

---

## What works

| Part | Address | Status |
|---|---|---|
| Front page | `/` | ✅ Heading, subtitle, two buttons |
| Pizza calculator | `/pizza` | ✅ Pizza types, grams, yeast from the forum chart, method with clock times, fridge rises. Always opens with the house recipe; «Husoppskriften» puts it back after a change |
| Recipe overview | `/oppskrifter` | ✅ Recipe cards (three views, the chosen one remembered), search (title, description, ingredients), "Hva med…?" (pizza on Fridays; on the right from lg), meal chips, a filter panel (meal, main ingredient, time, difficulty, cuisine, "Passer til", diet, with/without ingredients) with counts, the chosen filters as chips, sorting (Nyeste, A–Å, Raskest), grid/list view, a message when nothing matches. The search and the filters are kept in the address, so reload, back and a shared link keep them |
| Datasjekk | `/oppskrifter/datasjekk` | ✅ Not in the menu. Every recipe and what it's missing (photo, cuisine …), the most first; recipes that couldn't be read; ingredient names that are almost the same |
| Recipes from Sanity | | ✅ The site reads published recipes from Sanity with GROQ (`sanityClient.ts`, `sanityQuery.ts`), through `toRecipe`. Drafts don't show. Photos come in the right size from Sanity's image service, with the hotspot kept in view |
| Sanity Studio | `studio/`, online at `*.sanity.studio` | ✅ The editing tool, also on the phone: post a recipe with only a title and a photo, fill it in later. Only the title and slug are required; missing fields are warnings. Tabs, templates («Ny middag», «Ny dessert»), ingredient names to pick from, «Lim inn liste» (paste a whole ingredient list), and the Datasjekk in the left column |
| The site online | Vercel | ✅ Published from GitHub; `vercel.json` sends every page address to `index.html` (not `/api/…`, Vite's `/@…` or files with a dot) |
| The API | `/api/recipes`, `/api/photo` | ✅ Server functions on Vercel (task 5a): create a recipe (`POST`), change it field by field (`PATCH`), add a photo. Behind a lock: your Firebase login (`ADMIN_UID`), or the script key (`POST_SECRET`) for `npm run test:api`. The write token and the script key are only in `.env.local` and Vercel's Environment Variables (Production only, Sensitive). Run locally with `vercel dev` (port 3000). See [09](09-history.md), section 28 |
| The login | `/logg-inn` | ✅ Not in the menu. Log in with Google (Firebase Auth, task 5b), stays logged in after a reload, «Logg ut». The API only lets in your user id. See [09](09-history.md), section 29 |
| Loading and errors | | ✅ Each recipe page loads its data first ("Laster…"), and "Kunne ikke hente oppskriftene" + "Prøv igjen" if it fails. Every recipe is checked at the border (`toRecipe`) |
| Incomplete recipes | | ✅ Only the title is required. Cards and recipe pages show only what's filled in, and "Uferdig" until there are ingredients |
| Recipe page | `/oppskrifter/:id` | ✅ Modelled on Gladkokken on desktop (wide layout, ingredient panel) and Matprat on phones (the ingredients in the page, a section bar under the header): portion selector, groups, time/portions/difficulty and labels (with cuisine), cooking mode («Behold skjermen på», tick off steps), print and copy link |
| Unknown addresses | anything else | ✅ "Fant ikke siden" |
| Menu | | ✅ Shows the current page; the back button and reload work |
| API tests | `npm run test:api` | ✅ 34 checks against the running API (`vercel dev`, or online with `API_URL=https://…`): the lock, creating, the free address, what's refused, the photo, `PATCH` and every kind of field. Uses its own titles and deletes what it made |
| Tests | `npm test` | ✅ 276 tests: the API's rules (`toSlug`, `nextFreeSlug`, `readChanges`), yeast chart, dough maths, method, text formatting, search and every filter group, the counts, "Hva med…?", the Datasjekk, similar ingredient names, sorting, pasted ingredient lists, the recipe page's labels and sections, incomplete recipes, the border (`toRecipe`), the data layer, Sanity photos, and a check of every recipe in `data.ts` (the tests use `data.ts` instead of Sanity) |

---

## Known issues

Found during a full review of the code. Sorted by how much they matter.

### Important

**1. ~~`/oppskrifter` has no page yet.~~** ✅ Fixed: the overview page exists, so the menu link, the front page button and "← Alle oppskrifter" all work.

### Small

**2. ~~The browser tab says "mat-nettside".~~** ✅ Fixed: it says "Jens matnettside".
The `<title>` in `index.html` is still the project's folder name. → Change it to "Jens matnettside".

**3. ~~The site's name differs.~~** ✅ Fixed: "Jens matnettside" in the logo, footer and browser tab; the front page heading is a welcome line.
The logo says "Jens matnettside", the footer "Min matnettside", and the front page heading "Jens sin oppskriftsbank". → Decide on one name. The logo and footer at least should match.

**4. ~~Typo in the recipe text.~~** ✅ Fixed.

**5. ~~Leftover colour in `App.tsx`.~~** ✅ Fixed: removed.
The outer `<div>` has `bg-gray-50`. It isn't visible (every page has a white background), but it's the only `gray-*` colour left; the rest of the site uses `neutral-*`. → Change it to `bg-white`, or remove it.

**6. ~~Two knowledge files borrow types from components.~~** ✅ Fixed (12 November): `SelectOption` is in `pizza/settings.ts` and `ResultRow` in `pizza/calculateDough.ts`; the components import them from there.
`pizza/settings.ts` uses `SelectOption` from `SelectField`, and `pizza/calculateDough.ts` uses `ResultRow` from `ResultPanel`. It works, but breaks the rule that `pizza/` doesn't depend on the UI (see [01](01-architecture.md)). → Move the two types into `pizza/` (or a shared `types` file), and let the components import them from there.

**7. ~~`Container` is only used by one page.~~** ✅ Fixed (12 November): the pizza calculator uses it too. The front page and the overview keep their own vertical padding on purpose.
`HomePage` and `PizzaCalculatorPage` still write the same width classes themselves (`RecipePage` is deliberately wider). → Switch them to `Container`, so the width is set in one place. (`HomePage` needs its own vertical centring, so check that it still looks right.)

### Worth knowing (not bugs)

**8. The yeast chart guesses outside its range.** Very short or very long rises, or a short rise in the fridge, give an extended line rather than data. For example, 3 h at 4 °C gives an absurd amount of yeast. The field limits keep most settings reasonable.

**9. "Today" in the method is read when the page opens.** If the page is left open past midnight, the weekdays on long rises are a day off until you reload. Hardly matters in practice.

**10. Field labels include more than the name.** In `NumberField`, the whole row is a `<label>`, so a screen reader reads e.g. "Hydrering 61 % Vanlig: 60–70 %" as the field's name. It works, but could be more precise (`aria-describedby` for the hint).

**11. ~~Publishing needs one setting.~~** ✅ Fixed: `vercel.json` sends every address to `index.html`. When the site is put online (Netlify, Vercel …), the server must send every address to `index.html`, otherwise reloading on `/pizza` gives the host's own 404 page. Each host has a short guide for "single page apps".

**12. ~~The recipe page is wider than the header.~~** ✅ Fixed (12 November): the recipe page has the header's width, so the title starts under the logo and the ingredients end under the menu. The panel colour still reaches the screen edge.

**13. ~~Printing prints the whole page.~~** ✅ Fixed: the header, footer, menu, buttons and photo placeholder are hidden on paper, and the ingredients are printed before the steps (they used to be missing, since on paper the page is phone-width and they're behind the bar). Chromium may still put "Slik gjør du" alone at the bottom of a page. "Skriv ut" prints the header, the menu and the photo placeholder too. A print style (`print:hidden` on more elements) can make it tidier.

**14. ~~The filters are forgotten on reload.~~** ✅ Fixed in task 5: the search and the filters are in the address (`?sok=laks&maltid=Middag`), so reload, the back button and a shared link keep them.

**15. ~~Nothing checks recipe data while the site runs.~~** ✅ Fixed in task 4.1–4.2: every recipe goes through `toRecipe`.

**16. ~~The data layer answers instantly.~~** ✅ Fixed in task 4.3–4.5: a `Promise`, loaders, "Laster…" and an error page.

**17. Almost-the-same ingredient names become separate filter options.** ✅ Mostly handled: the Studio suggests names already used (`IngredientNameInput`), and the Datasjekk (on the site and in the Studio) lists names that are almost the same; fixing them is still by hand. "tomat" and "tomater" are two options, and "Uten tomat" misses the other. Pasted lists («Lim inn liste») skip the suggestions, so check those.

**18. Firebase makes the site's code bigger.** Since the login (5b), the main JavaScript file is about 610 kB (190 kB compressed), and `vite build` warns about the chunk size. It works, but every visitor downloads the login code too. Fix in 5c: load Firebase only where it's needed (a dynamic `import()`, or `React.lazy` for the admin pages).

---

## Next steps

Moved to **[10 – Tasks](10-tasks.md)**, which is kept up to date as the to-do list.

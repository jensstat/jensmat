# 08 – Status

Where the project stands: what works, what's missing, and known issues. **Update this file when something changes.**

*Last checked: 14 November 2026 (late evening). Type check, lint, Prettier, 328 tests and the build all pass. **The site works as an app** on the iPhone's home screen (task 5d), including the login inside the app, and the pizza calculator has a cooking mode. Before that, the same evening: The recipes come from Sanity, and the site is online (Vercel), with its own API (`api/`), a login (Google via Firebase) and **the admin mode** (task 5c): quick posting at `/ny-oppskrift`, «Rediger» on the recipe page, the admin bar. `npm run test:api` has 42 checks. Every 5c step was tried in the browser at phone and desktop width, with stand-ins for the login and the API, and checked by you with `vercel dev` and the real login. The main JavaScript file is back to its size before Firebase (about 507 kB).*

**What to do next is in [10 – Tasks](10-tasks.md).** This file is about what works and what's known to be wrong.

---

## What works

| Part | Address | Status |
|---|---|---|
| Front page | `/` | ✅ Heading, subtitle, two buttons |
| Pizza calculator | `/pizza` | ✅ Pizza types, grams, yeast from the forum chart, method with clock times, fridge rises. Always opens with the house recipe; «Husoppskriften» puts it back after a change. On phones the result comes first (− + for the number of pizzas), with a jump bar. Tick off the grams while weighing, and a cooking mode in the method: «Behold skjermen på», tick off steps, «NÅ» from the clock |
| The app (PWA) | the home screen | ✅ Add to the home screen (iPhone: Safari → Del → «Legg til på Hjem-skjerm»): its own icon, full screen, opens at the recipes. Always the newest version. Its own login, separate from Safari. Not offline. See [11](11-user-guide.md), section 4 |
| Recipe overview | `/oppskrifter` | ✅ Visitors only see finished recipes; you see all, «Uferdig» marked. Recipe cards (three views, the chosen one remembered), search (title, description, ingredients), "Hva med…?" (pizza on Fridays; on the right from lg), meal chips, a filter panel (meal, main ingredient, time, difficulty, cuisine, "Passer til", diet, with/without ingredients) with counts, the chosen filters as chips, sorting (Nyeste, A–Å, Raskest), grid/list view, a message when nothing matches. The search and the filters are kept in the address, so reload, back and a shared link keep them |
| Datasjekk | `/oppskrifter/datasjekk` | ✅ In the admin bar, not in the menu. Every recipe and what it's missing (photo, cuisine …), the most first; recipes that couldn't be read; ingredient names that are almost the same. Logged in: «Rediger» on each recipe, and each missing thing opens the editor at that field |
| Recipes from Sanity | | ✅ The site reads published recipes from Sanity with GROQ (`sanityClient.ts`, `sanityQuery.ts`), through `toRecipe`. Drafts don't show. Photos come in the right size from Sanity's image service, with the hotspot kept in view |
| Sanity Studio | `studio/`, online at `*.sanity.studio` | ✅ The editing tool, also on the phone: post a recipe with only a title and a photo, fill it in later. Only the title and slug are required; missing fields are warnings. Tabs, templates («Ny middag», «Ny dessert»), ingredient names to pick from, «Lim inn liste» (paste a whole ingredient list), and the Datasjekk in the left column |
| The site online | Vercel | ✅ Published from GitHub; `vercel.json` sends every page address to `index.html` (not `/api/…`, Vite's `/@…` or files with a dot) |
| The API | `/api/recipes`, `/api/photo` | ✅ Server functions on Vercel (task 5a): create a recipe (`POST`), change it field by field (`PATCH`, also the photo's focus point), delete it (`DELETE`), add a photo. Behind a lock: your Firebase login (`ADMIN_UID`), or the script key (`POST_SECRET`) for `npm run test:api`. The write token and the script key are only in `.env.local` and Vercel's Environment Variables (Production only, Sensitive). Run locally with `vercel dev` (port 3000). See [09](09-history.md), section 28 |
| The login | `/logg-inn` | ✅ «Logg inn» in the footer on every page (also in the app), back to the page you were on afterwards. Not in the menu. Log in with Google (Firebase Auth, task 5b), stays logged in after a reload. «Logg ut» in the admin bar. The API only lets in your user id. Firebase is only downloaded on the admin's pages. See [09](09-history.md), section 29 |
| Quick posting | `/ny-oppskrift` | ✅ The admin's quick way to post (task 5c), made for the phone: a title and maybe a photo (shrunk in the browser). «Lagre» → the recipe, «Lagre og fyll ut resten» → «Rediger». See [09](09-history.md), section 30 |
| «Rediger» | `/oppskrifter/:id?rediger` | ✅ The whole recipe as a form, only for the admin. Sends only the changes; «Mangler», a jump bar, name suggestions, «Lim inn liste», the photo's focus point, «Slett oppskrift». Asks before unsaved changes are lost, keeps a draft in the browser, «Logg inn igjen» if the login runs out |
| The admin bar | every page | ✅ Only when logged in: `Admin · + Ny oppskrift · Datasjekk · Logg ut`, on top of the header |
| Loading and errors | | ✅ Each recipe page loads its data first ("Laster…"), and "Kunne ikke hente oppskriftene" + "Prøv igjen" if it fails. Every recipe is checked at the border (`toRecipe`) |
| Incomplete recipes | | ✅ Only the title is required. Cards and recipe pages show only what's filled in, and "Uferdig" until there are ingredients |
| Recipe page | `/oppskrifter/:id` | ✅ Modelled on Gladkokken on desktop (wide layout, ingredient panel) and Matprat on phones (the ingredients in the page, a section bar under the header): portion selector, groups, time/portions/difficulty and labels (with cuisine), cooking mode («Behold skjermen på», tick off steps), print and copy link |
| Unknown addresses | anything else | ✅ "Fant ikke siden" |
| Menu | | ✅ Shows the current page; the back button and reload work |
| API tests | `npm run test:api` | ✅ 42 checks against the running API (`vercel dev`, or online with `API_URL=https://…`): the lock, creating, the free address, what's refused, the photo, `PATCH` and every kind of field, the focus point, `DELETE`. Uses its own titles and deletes what it made |
| Tests | `npm test` | ✅ 328 tests: «NÅ» in the pizza method (`currentStep`), the admin mode's rules (`recipeChanges`, `readForm`, ingredient lines, drafts, photo sizes), the API's rules (`toSlug`, `nextFreeSlug`, `readChanges`), yeast chart, dough maths, method, text formatting, search and every filter group, the counts, "Hva med…?", the Datasjekk, similar ingredient names, sorting, pasted ingredient lists, the recipe page's labels and sections, incomplete recipes, the border (`toRecipe`), the data layer, Sanity photos, and a check of every recipe in `data.ts` (the tests use `data.ts` instead of Sanity) |

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

**18. ~~Firebase makes the site's code bigger.~~** ✅ Fixed in 5c: the login page and the admin pages are their own files (`lazy`), and the public pages only read the login note (`auth/loginHint.ts`), so visitors never download Firebase. The main file is back to about 507 kB. `vite build` still warns about it being over 500 kB, as it did before Firebase (React, React Router and Sanity's client).

**19. Old photos stay in Sanity.** A replaced photo, and the photo of a deleted recipe, stay in the media library (unused). Delete them in the Studio's media browser now and then, if the space matters.

**20. The site and the Studio don't see each other's unsaved work.** «Rediger» changes the published recipe. If the same recipe has an unpublished draft in the Studio, publishing that draft later overwrites what was saved on the site. Edit a recipe in one place at a time.

**21. A draft from «Rediger» is kept in one browser only,** and without a new photo. It's a safety net for crashes, not a way to move work between the phone and the Mac.

**22. Most recipes are hidden from visitors right now.** Only finished recipes (with ingredients) are shown on the overview, and at the time of writing that's 3 of 9. Fill them in from the Datasjekk.

**23. «NÅ» on the pizza calculator assumes the baking is today.** For a long rise started the day before, it counts from today's «Stekes kl.», and can be on the wrong step. The clock times (with the weekday) are right.

**24. The app icon is Vite's logo** (the favicon that came with `npm create vite`). Replace `public/icon-512.png` and `public/favicon.svg` when you have your own ([07](07-how-to.md)).

**25. Not possible on the iPhone:** sharing a photo *to* the app from the Photos app (Safari doesn't support a *share target* for web apps). Post from inside the app.

---

## Next steps

Moved to **[10 – Tasks](10-tasks.md)**, which is kept up to date as the to-do list.

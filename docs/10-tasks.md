# 10 – Tasks

The to-do list. **Tick things off (`- [x]`) as you go, and move the "Now" marker down.**
Known bugs and quirks are in [08 – Status](08-status.md); this file is about what to *build* next.

*Last updated: 12 November 2026 (evening). Done: tasks 1–6 of the first list (Sanity, the filters in the address …), a friendlier Studio, ingredient names to pick from, the overview's views, and from the second list tasks 1–4 (pasting an ingredient list, the Datasjekk in the Studio, cuisine and difficulty on the recipe page; remembering the pizza settings was dropped for a «Husoppskriften» button). After that, the design: the overview's top in two columns, the whole site a bit wider, and the recipe page on phones like Matprat, with cooking mode (sections 23–24 in [09](09-history.md)). Then a clean-up of the code and the docs. **Next:** see "Now" below.*

---

## Now: the next tasks, in order

Agreed 12 November, after the first order was finished. Small things that help right away come first; the biggest (own posting) comes last, when you've used the Studio on the phone for a while and know better what your own form should do differently.

**Next, agreed 12 November (evening), for the design:**
- [x] **The recipe page lined up with the header** ✅ (12 November): `max-w-7xl` and the header's padding, checked at 1024, 1440 and 1920px (the title under the logo, the ingredients ending under the menu). The panel colour still reaches the screen edge
- [x] **Clickable labels** on the recipe page ✅ (12 November): «Italiensk» → `/oppskrifter?kjokken=Italiensk` (`filterLink` in `filter.ts`, with tests). «Rask» → «Rask (inntil 30 min)», a new choice in «Tid»
- [x] **Sorting** on the overview (Nyeste, A–Å, Raskest) ✅ (12 November): `recipes/sort.ts` with tests, `SortSelect`, in the address (`?sortering=raskest`)
- ~~A layout for recipes without a photo~~ Not needed: every dish should have a photo

**The second list:**

1. [x] **Paste a whole ingredient list in the Studio** ✅ (12 November: «Lim inn liste» under the ingredients, `studio/components/IngredientListInput.tsx` + `src/recipes/parseIngredients.ts`, with tests): paste "2 dl melk / 3 egg / salt" and get three ingredient lines. Builds on the own input from "ingredient names to pick from"
2. [x] **The Datasjekk in the Studio** ✅ (12 November: «Datasjekk» in the left column, `studio/dataCheck.ts`, live counts): a list in the left column of recipes missing something, reusing the rules in `src/recipes/completeness.ts` (like the Studio already reuses `cleanName`)
3. [x] **Cuisine, difficulty and "Passer til" on the recipe page** ✅ (12 November: the difficulty with a bars icon in `RecipeMeta`, the cuisine as a label) (the labels already show the themes)
4. [x] ~~**The pizza calculator remembers its settings**~~ Dropped (12 November): the house recipe is what's usually baked, so the page always opens with it. Instead: a **«Husoppskriften»** button that puts it back after a change (`localStorage`, checked when it's read, like the overview's view)
5. [ ] **Another way to post recipes** (the long-term goal), in parts:
   - [ ] 5a. **A server function** on Vercel that holds the Sanity **token** (never in the browser) and creates the recipe
   - [ ] 5b. **A login**, so only you can post
   - [ ] 5c. **The form** at `/ny-oppskrift`: title, a photo from the camera, the rest optional (the same fields as `Recipe`)
   - [ ] 5d. **Make it feel like an app**: a *PWA*, installable on the phone's home screen with its own icon
   - [ ] 5e. **A real phone app** (App Store), only if the PWA isn't enough

**Writing ingredients by feel** (asked 12 November, about Laksewrap's "½ salat, ¼ paprika"): no new feature needed. Leave the amount empty, and say it in a group ("Grønnsaker (etter ønske)") or the note ("etter ønske"). See `docs/03-recipes.md`, section 2.

---

## Starting a new working session

Start each new task in a fresh Claude Code session (`/clear`): it's cheaper, and nothing old gets in the way. Paste an opening line like this:

> We're working on **[the task]**. Read `docs/10-tasks.md` and the files it mentions. I want to build it myself as a **tutorial**: one small change per message, shown in full, then "save and look", and wait for me before the next step. **Teach me the ideas behind the code**, not just the code.

For a task, for example (task 6 is done, kept as an example):

> We're working on **Sanity, the CMS** (task 6 in `docs/10-tasks.md`). Read task 6 there, `docs/03-recipes.md` sections 2 and 3, `src/recipes/types.ts`, `src/recipes/toRecipe.ts` and `src/recipes/recipes.ts`. I want to **learn how Sanity works**: tutorial, one small step per message, and teach me the ideas (Studio, schemas, documents, GROQ …) before the code. Start with step 6.1.

For task 5, the next task:

> We're working on **the filters in the address** (task 5 in `docs/10-tasks.md`). Read `docs/03-recipes.md` sections 3 and 6, `docs/06-react-and-typescript.md` (React Router), `src/routes.tsx`, `src/loaders.ts`, `src/recipes/filter.ts`, `src/recipes/filter.test.ts` and `src/pages/RecipeListPage.tsx`. Tutorial, one small step per message, and teach me the ideas behind the code. Start with step 5.1.

If you're not interested in a part, say so ("just build this part"), and ask for a tutorial again for the next.

**Keep in mind for every task:**
- The recipes will later come from a **CMS**, posted from a phone app. So logic works on the `Recipe` type, never on where the data comes from.
- **Only the title is required.** Any feature must work for a recipe that has nothing but a title (like "Fiskesuppe" in `data.ts`).
- **Missing information is normal.** A new field on the recipe is optional, gets `hasInfo` if it's a filter group, and a line in the Datasjekk (`recipes/completeness.ts`), so you can see which recipes lack it.
- **Checking the code:** the AI's sandbox can't run your Mac's `node_modules`. It can make its own Linux copy in its scratchpad to run the checks, or ask you to run `npm test` and `npm run build`.

**Before you `/clear`:** `npm run format`, commit, and tick off what's done here.

---

## ✅ Done: Sanity, the CMS (task 6)

**The goal:** post a recipe from the phone (maybe just a title and a photo), fill it in later, and see it on the site. **The focus is learning Sanity**, so each step starts with the idea, then the code.

**What Sanity is, in short:** a *headless* CMS. "Headless" means it only stores and serves the content; it doesn't draw the website. That's still your React site. Sanity has three parts:
- **The Content Lake:** Sanity's database, online. Your recipes live in a *project*, in a *dataset* (called `production`).
- **Sanity Studio:** the editing tool, a React app you set up and change in code. It runs on your machine while you build it, and can be put online (`*.sanity.studio`) to use from the phone.
- **The API:** the site asks for content with a query language, **GROQ**, and gets JSON back.

**Why task 4 made this easy:** the site already waits for its data (loaders, "Laster…", the error page), and everything goes through `toRecipe`. So on the site's side, only `fetchRecipes` in `recipes.ts` changes. Most of the learning is in the Studio and in GROQ.

**Decided before starting:**
- The Studio lives in a **`studio/` folder** in this repo, with its own `package.json`. Then it can import the fixed lists from `src/recipes/types.ts`, so they're written in one place.
- **The `slug` field is the recipe's id** (the address, `/oppskrifter/laksewrap`). Made from the title, and never changed once published. Sanity's own slug function already turns Norwegian letters into a–z ("Havregrøt med bær" → `havregrot-med-baer`), so the id passes the test in `data.test.ts` without a custom function.
- **`data.ts` stays, but only for the tests** (`filter.test.ts` and `data.test.ts` use it). The site reads from Sanity.
- **Missing is normal in Sanity too:** only the title (and the slug) are *required*. Missing fields are **warnings** (yellow), not errors, so a half-done recipe can still be published, the same rule as the Datasjekk.

Suggested tutorial steps:

- [x] 6.1 **A Sanity project and a Studio.** Make a free account, then `npm create sanity@latest` in `studio/` (empty project, TypeScript). Run the Studio at `localhost:3333` and look around. *The idea:* project, dataset, Studio, the Content Lake, and why the Studio is a separate app from the site
- [x] 6.2 **The first schema: a recipe with only a title.** A `recipe` document type with `title` (required) and `slug` (made from the title). Make "Fiskesuppe" in the Studio, and publish it. *The idea:* a schema describes the form, `defineType` / `defineField`, documents, `_id`, and **drafts vs published**
- [x] 6.3 **The fixed lists, from `types.ts`.** Måltid, Hovedingrediens, Kjøkken and Vanskelighetsgrad as dropdowns (`options.list`), and Tilpasninger, Passer til and Ukedag/Helgemat as checkboxes (an array of strings). Imported from `src/recipes/types.ts`, so adding a cuisine there adds it in the Studio too. *The idea:* one source of truth, and that the Studio is just TypeScript
- [x] 6.4 **The rest of the fields.** Description, portions and time (numbers above 0), steps (a list of text), source and tips. Then **ingredients**: a list of objects (amount, unit, name, note, group), with a `preview` so each line reads "2 dl melk". Warnings for what the Datasjekk checks ("Mangler kjøkken"). *The idea:* field types, `object` and `array`, `preview`, and validation (`rule.required()` vs `rule.warning()`)
- [x] 6.5 **The photo.** An `image` field with `hotspot` (you choose the important part of the photo, and it stays in view when it's cropped). Upload a photo of a dish. *The idea:* assets: the photo is stored once, and the recipe points to it (a *reference*)
- [x] 6.6 **GROQ, in the Studio's Vision tool.** Add the Vision plugin and try queries by hand: `*[_type == "recipe"]`, then a **projection** that gives exactly the shape `toRecipe` wants: `"id": slug.current`, `"image": image.asset->url`, `"createdAt": _createdAt`. Sort, filter on one id. *The idea:* GROQ: filter `[…]`, projection `{…}`, `->` follows a reference, and why reshaping in the query means `toRecipe` doesn't have to change. (One fix there: `_createdAt` is a full time, `"2026-11-12T10:15:00Z"`, so `date()` in `toRecipe` should read the first 10 characters)
- [x] 6.7 **The site reads from Sanity.** `@sanity/client` in the site, with the project id in a `.env` file (`VITE_SANITY_PROJECT_ID`), and `localhost:5173` added under **CORS origins** at sanity.io/manage. `fetchRecipes` runs the GROQ query and sends the answer through `readRecipes`; a failed fetch throws `RecipesUnavailableError` (the error page you already have). Remove the pretend delay. *The idea:* environment variables, CORS (why the browser asks Sanity "may this site read you?"), `useCdn`, and that a public dataset only shows **published** recipes
- [x] 6.8 **Photos in the right size.** `imageUrl(recipe, width)`: Sanity's image service resizes on request (`?w=600&auto=format`), so a card gets a small photo and the recipe page a large one. Used in `RecipeImage` and `RecipeCard`. *The idea:* image CDNs, and why you never send a 4 MB phone photo to a small card
- [x] 6.9 **Move the recipes over.** Type Laksewrap into the Studio (good practice for the form), decide what to do with the placeholders, and check the Datasjekk and "Like ingrediensnavn" with the real data
- [x] 6.10 **The Studio on the phone.** `npx sanity deploy` puts the Studio online at `https://<name>.sanity.studio`. Log in on the phone, post a recipe with only a title and a photo from the camera, and fill it in later from the computer. *The idea:* a hosted Studio, logins and who may edit
- [x] 6.11 **The site online.** Publish it (Vercel or Netlify): the setting that sends every address to `index.html` (see 08, issue 11), the `.env` values on the host, and the real address under CORS origins. Then a recipe posted from the phone shows up on the real site
- [x] 6.12 Check: a title-only recipe, a recipe with a photo, an unpublished draft (shouldn't show), no internet (the error page), and on the phone

**Maybe later, with Sanity:**
- [x] Ingredient names to pick from (12 November, `studio/components/IngredientNameInput.tsx`): the Studio suggests names already used, so "tomat" and "tomater" don't both happen. Suggestions, not a closed list: a new name can still be typed, and is suggested next time (the list is "every name used so far", from GROQ). Not ingredients as their own documents with references: slower on the phone, and every recipe would need converting; only worth it if ingredients get their own data (nutrition, shopping list)
- [x] The Datasjekk in the Studio ✅ (`studio/dataCheck.ts`, the site's own rules)
- [ ] Sanity TypeGen (makes TypeScript types from the schema). Not needed now: `toRecipe` is the border

**A friendlier way to post recipes** (asked 11 November 2026, after 6.10). Three levels, least work first:
- [x] **A friendlier Studio** (12 November): tabs (`groups`): **Raskt** (title, address, photo; the form opens there), Detaljer, Ingredienser, Fremgangsmåte (Porsjoner on two tabs); **placeholders** on Porsjoner and Tid (a hint, never saved, so the Datasjekk still sees what's missing); **templates** on the "+" button, "Ny middag" and "Ny dessert" (`schema.templates` in `sanity.config.ts`); **own lists** in the left column, "Uferdige" and "Mangler bilde" (`studio/structure.ts`, GROQ filters). Deployed and checked on the phone. *Not* plain `initialValue` on fields: a starting value is real data and would hide a missing field from the Datasjekk
- [x] Own input components in the Studio: ingredient names to pick from ✅
- [x] Paste a whole ingredient list and split it into lines (an own input on the ingredient list) ✅
- [ ] **An own form on the site** (`/ny-oppskrift`): writing needs a Sanity **token**, which must never be in the browser (nothing secret in `VITE_…`). So: the form → a **server function** on the host (Vercel/Netlify, after 6.11) that holds the token, checks that it's you (a login), uploads the photo (`client.assets.upload`) and creates the recipe → Sanity. The form fills in the same fields as `Recipe`, and the site keeps reading through `toRecipe`. Alternative: Sanity's **App SDK** (own React apps that use the Sanity login, no token on an own server); check Sanity's docs for how it's set up
- [ ] **A phone app** (the long-term goal): the same as the form, as an app

---

## ✅ Done: the recipe overview (task 5)

**Done** (what was built, and why, is in [09 – History](09-history.md), sections 11–15):
- ✅ **1. Search** in the title, the description and the ingredients
- ✅ **2. "Hva med…?"**: a complete dinner that suits the day (Ukedag/Helgemat), and pizza on Fridays
- ✅ **3. The filter panel**, modelled on Matprat: Måltid, Hovedingrediens, Tid, Vanskelighetsgrad, Kjøkken, Passer til, Tilpasninger, Har/Uten ingredienser, with counts. The meal chips are a shortcut to Måltid. Plus the **Datasjekk** at `/oppskrifter/datasjekk`. How it works: [03](03-recipes.md), section 6
- ✅ **4. A CMS-ready data layer**: the border (`toRecipe`), a data layer that waits, loaders, "Laster…" and the error page, similar ingredient names. The steps are below, kept for reference
- ✅ **5. The filters in the address**: `?sok=laks&maltid=Middag`, kept on reload, back and in a shared link; "← Alle oppskrifter" goes back to the filtered list. The steps are below, kept for reference

### 4. A CMS-ready data layer

**Why now:** the shape of a recipe is ready for a CMS, but two things would break the day the recipes come from the internet instead of `data.ts`. It's much cheaper to fix them now, while only three pages read recipes, and before task 5 builds on how the pages get their data.

1. **Nothing checks the data at the border.** TypeScript only checks the code, not data that arrives while the site runs, and `data.test.ts` only checks `data.ts`. A recipe from a CMS without an `ingredients` list would crash the page on `.map()`.
2. **The data layer answers instantly; a CMS doesn't.** `getAllRecipes()` returns at once. Fetching takes time and can fail, so the pages need "loading" and "couldn't load" states, and "Hva med…?" must pick from recipes that have arrived.

Plus one thing for typing recipes on a phone: **ingredient names that are almost the same** ("tomat" / "tomater") become separate filter options.

Suggested tutorial steps:

- [x] 4.1 **`toRecipe(raw)`**, the translation at the border, in a new `recipes/toRecipe.ts`, with tests. It takes `unknown` (anything) and gives a valid `Recipe`, or `undefined` if there's no id or title. A missing list becomes `[]`; a value that isn't in its fixed list (a category "Midag", a cuisine that doesn't exist) is left out; a number that isn't a number is left out; the title is trimmed. *The idea:* `unknown`, and checking data while the site runs (`typeof`, `.includes` on the fixed lists)
- [x] 4.2 **`data.ts` goes through the border too.** `recipes.ts` runs every recipe through `toRecipe`, so today's data takes the same path as CMS data will. A recipe that can't be read is skipped and named in the browser console (and listed on the Datasjekk), never crashing the page
- [x] 4.3 **A data layer that waits.** `getAllRecipes()` and `getRecipe(id)` return a `Promise`, still reading `data.ts` (with a short pretend delay while testing, to see the loading). *The idea:* `Promise`, `async`/`await`
- [x] 4.4 **React Router loads the data before showing the page.** `main.tsx` switches from `<BrowserRouter>` to `createBrowserRouter`, and `/oppskrifter`, `/oppskrifter/:id` and `/oppskrifter/datasjekk` each get a `loader`. The pages read it with `useLoaderData()`. An unknown recipe id still shows "Fant ikke siden". "Hva med…?" picks from the loaded recipes
- [x] 4.5 **Loading and error states.** A calm "Laster…" while a page waits (`useNavigation`), and "Kunne ikke hente oppskriftene" with a "Prøv igjen" button when it fails (`errorElement`). Test by making the pretend fetch fail on purpose
- [x] 4.6 **Similar ingredient names on the Datasjekk**: `similarIngredientNames(recipes)` in `completeness.ts`, with tests. Names that are the same apart from a Norwegian plural ending ("tomat"/"tomater", "paprika"/"paprikaer") or one letter ("hvitlauk"/"hvitløk"), shown with the recipes that use each, so they're easy to make the same
- [x] 4.7 Check: `npm test`, every page on the phone and desktop, a slow connection (the browser's dev tools can pretend to be on a slow network), and the error state

### 5. The filters in the address ✅

Store the search and every filter in the address (`/oppskrifter?sok=laks&maltid=middag&tid=20–40+min`), so reload and the back button keep them, and a filtered list can be shared as a link. Today they're `useState` in `RecipeListPage`, so a reload clears them. Suggested tutorial steps:

- [x] 5.1 Only the search, first: read and write `?sok=` with React Router's `useSearchParams`. The address *is* the state now. Reload keeps the text
- [x] 5.2 Two pure functions in `recipes/filter.ts`: `filtersToParams(filters)` and `filtersFromParams(params)`, with tests (there and back again gives the same filters). Each filter group gets a Norwegian name for the address: a new `param` field in `FilterGroup` (`"maltid"`, `"hovedingrediens"`, `"tid"` …), since the `id`s are English
- [x] 5.3 The page reads its filters from the address instead of `useState`, and every change writes the address. While typing, replace the address instead of adding to the history, so the back button isn't full of single letters. **Important:** a change to the address makes React Router run the page's loader again, so every letter typed would fetch the recipes again ("Laster…" flashes now, and a request to Sanity per letter once the CMS is in). Give the `/oppskrifter` route a `shouldRevalidate` that says no when only the `?…` part changed. *The idea:* when loaders run, and why
- [x] 5.4 Unknown or old values in an address are ignored, so a link with `?kjokken=marsiansk` doesn't break anything. With tests. (`filtersFromParams(params, recipes)` keeps only values the panel could have ticked, since the ingredient options come from the recipes)
- [x] 5.5 Check: reload, the back button, a shared link, and on the phone
- [x] 5.6 (found in the check) "← Alle oppskrifter" on a recipe went to the plain list. Now the cards bring the list's `?…` part along in the link's `state` (`recipes/listLink.ts`), so it goes back to the filtered list

**Maybe later on the overview:**
- [x] The third view, "Store" (big cards, 1 per row on phones, with photos big enough: its own `sizes`) (12 November)
- [x] Remember the chosen view with `localStorage`, checked when it's read (`components/recipe/recipeView.ts`, with tests) (12 November)
- [x] Show cuisine, difficulty and "Passer til" on the recipe page ✅

---

## Ideas (no order)

**Front page**
- ~~"Nyeste oppskrifter": the newest recipes, reusing `RecipeCard`~~ Dropped (12 November): tried, and the front page should stay as it is, with only the heading and the two buttons
- [ ] "Hva skal vi spise i dag?": a random recipe

**Pizza calculator**
- ~~Remember the settings when the page is reloaded (`localStorage`)~~ Dropped (12 November): always the house recipe, plus a «Husoppskriften» button
- [ ] Share settings as a link
- [ ] Test-bake "Forum-basert" vs "Hjemmeoppskrift", and adjust
- [ ] The 48 h+ yeast chart (forum reply #406)
- [ ] Sourdough, with its own calculation (hidden for now)

**Code tidy-up**
- [x] Move `SelectOption` and `ResultRow` out of the components (08, issue 6) ✅ (now in `pizza/settings.ts` and `pizza/calculateDough.ts`)
- [x] Use `Container` on more pages (08, issue 7) ✅ (the pizza calculator; the front page and the overview keep their own vertical padding)

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
- [x] A CMS-ready data layer: `toRecipe` at the border, a `Promise` data layer, React Router loaders, loading and error states, similar ingredient names on the Datasjekk, with tests
- [x] Sanity, the CMS: a Studio in `studio/` (also online, for the phone), the schema with the fixed lists from `types.ts`, the site reading published recipes with GROQ, photos in the right size, and the site online on Vercel
- [x] Small fixes: one name for the site ("Jens matnettside" in the logo, footer and browser tab), the leftover `bg-gray-50` removed, and a printout with the ingredients and without the header, menu and buttons
- [x] The filters in the address: the search and every filter in `?sok=…&maltid=…`, so reload, the back button and a shared link keep them; no new fetch from Sanity while filtering; unknown values ignored; "← Alle oppskrifter" goes back to the filtered list. With tests

# 01 – Architecture: the big picture

This file explains **how the pieces fit together**. If you only read one documentation file, read this one.

---

## 1. From the address bar to the screen

What happens when you open `localhost:5173/oppskrifter/laksewrap`:

```
index.html            The only HTML file. Has an empty <div id="root"> and loads main.tsx.
   │
   ▼
src/main.tsx          Starts React, and starts React Router (createBrowserRouter) with the routes.
   ▼
src/routes.tsx        Every address, its page, and its loader (what it needs first, loaders.ts):
   │                    /                  → HomePage
   │                    /pizza             → PizzaCalculatorPage
   │                    /oppskrifter       → RecipeListPage (all recipes)        loader
   │                    /oppskrifter/:id   → RecipePage   (:id = "laksewrap")    loader
   │                        ?rediger       → the same page, with «Rediger» open (the admin)
   │                    /oppskrifter/datasjekk → DataCheckPage (not in the menu) loader
   │                    /logg-inn          → LoginPage    (not in the menu)       lazy
   │                    /ny-oppskrift      → NewRecipePage (the admin's quick post) lazy, action
   │                    *  (anything else) → NotFoundPage
   │                  If a loader fails: RouteErrorPage ("Kunne ikke hente oppskriftene").
   │                  lazy: the page is its own file, downloaded the first time it's opened.
   ▼
src/App.tsx           The frame that's the same on every page:
   │                    <Header />  →  <main> with the current page (<Outlet />)  →  <Footer />
   │                  Shows "Laster…" while the next page's loader waits.
   ▼
src/pages/RecipePage.tsx
   │                  Gets the recipe from its loader (useLoaderData), already fetched,
   │                  and puts the page together from smaller components.
   ▼
src/components/…      The building blocks: IngredientList, StepList, PortionStepper …
```

**Key idea:** there's only one real HTML page. React swaps the content inside `<main>` when the address changes. That's why the site feels instant, and why links use `<Link>` instead of `<a href>`: an `<a>` would reload everything from scratch.

---

## 2. The folders, and why they're split this way

```
src/
├── main.tsx, App.tsx, index.css     Start-up, the frame, global styles
├── routes.tsx, loaders.ts           The addresses, and what each page loads first
│
├── pages/          ONE FILE PER ADDRESS. Puts a whole page together, and holds its state.
│                   HomePage, PizzaCalculatorPage, RecipeListPage, RecipePage,
│                   DataCheckPage, LoginPage, NewRecipePage, NotFoundPage, LoadingPage,
│                   RouteErrorPage
│
├── admin/          THE ADMIN MODE (task 5c). «Rediger» (RecipeEditor and its fields), what
│                   «Lagre» on /ny-oppskrift does (newRecipeAction), the calls to the API
│                   (api.ts), and the rules behind them: recipeChanges, readForm,
│                   ingredientLines, draft, photoSize (tests next to each). Only loaded for
│                   the admin, so visitors never download it
│
├── auth/           THE LOGIN (Firebase, Google). firebase.ts (the connection), useUser.ts
│                   (who is logged in), adminFetch.ts (fetch with your login), session.ts
│                   (log in/out without loading Firebase up front), loginHint.ts (the note
│                   "someone has logged in here", which the public pages read)
│
├── components/     UI BUILDING BLOCKS. Get data through props, report changes through onChange.
│   │               Header, AdminBar, Footer, Container, Notice, the input fields, ResultPanel, Instructions,
│   │               icons.tsx (✕, ✓ …) and focusRing.ts (the keyboard focus ring)
│   └── recipe/     Building blocks used only by recipes: IngredientList, StepList,
│                   RecipeCard, SearchField, FilterPanel …
│
├── pizza/          PIZZA KNOWLEDGE. Plain TypeScript, no React: settings, maths, yeast chart, method.
│                   Each file has a .test.ts next to it.
│
└── recipes/        RECIPE KNOWLEDGE. Plain TypeScript, no React: what a recipe is, the data,
                    the data layer, how things are shown as text, the filters, the
                    "Hva med…?" suggestion and the Datasjekk. Tests next to each file.

api/                THE SERVER. Runs on Vercel, never in the browser, so it may hold the
                    Sanity write token. _auth.ts lets in your Firebase login or the
                    script key (POST_SECRET). Each file is an address (recipes.ts → /api/recipes,
                    photo.ts → /api/photo); files starting with _ are helpers (_sanity, _auth,
                    _slug, _changes). Uses only types.ts from src/. Own tsconfig.api.json.
scripts/            check-api.mjs: npm run test:api, which tests the API for real
studio/             Sanity Studio, the editing tool (own package.json)
```

### The three layers

Think of the code as three layers, where each layer only **uses** the layers below it:

```
┌────────────────────────────────────────────┐
│  pages/       "What's on this page?"       │  uses components and knowledge
├────────────────────────────────────────────┤
│  components/  "How does it look?"          │  uses knowledge (to format text)
├────────────────────────────────────────────┤
│  pizza/  recipes/   "What's true?"         │  uses nothing from React
└────────────────────────────────────────────┘
```

**Why it matters:**
- **The maths can be tested on its own.** `calculateDough` and the yeast chart are tested without opening a browser (`npm test`).
- **Things can change without breaking each other.** Restyling the recipe page doesn't touch `recipes/`. Moving recipes to a CMS changes `recipes/recipes.ts`, not the pages.
- **You know where to look.** A wrong number is in `pizza/` or `recipes/`. A wrong colour is in `components/` or `pages/`.

> **One known exception:** `pizza/settings.ts` and `pizza/calculateDough.ts` borrow two *types* from components (`SelectOption` and `ResultRow`). It works fine, since types disappear when the code runs, but it breaks the rule above. See [08 – Status](08-status.md).

---

## 3. Where state lives

"State" is data React remembers and that can change: what's in a field, which time you chose. **The rule: state lives in the lowest component that needs it, and no lower.**

| State | Lives in | Why there |
|---|---|---|
| All pizza settings (`settings`) | `PizzaCalculatorPage` | Both the fields **and** the result need it, so it lives in the page above them |
| The baking time (`bakeTime`) | `Instructions` | Only the method needs it |
| The chosen portions (`servings`) | `RecipeView` (in `RecipePage`) | Both the desktop panel and the phone menu show it |
| The overview's view (`view`) | `RecipeListPage` (and `localStorage`) | The toggle and the cards depend on it; remembered in the browser |
| The search, the filters and the order | The address (`?sok=laks&maltid=Middag`) | So reload, back and a shared link keep them |
| Whether «Rediger» is open | The address (`?rediger`) | So a reload stays in the editor, and the Datasjekk can link to a field (`?rediger=cuisine`) |
| The editor's fields | The form itself (read with `FormData`) | Only the lists (`StepsField`, `IngredientsField`) hold state, since their length and order change |
| The draft of «Rediger» | `localStorage` (`utkast:<slug>`) | Survives a crash or a closed tab (`admin/draft.ts`) |
| "Someone has logged in here" | `localStorage` (`innlogget`), read with `useLoginHint` | The public pages can show the admin links without loading Firebase (`auth/loginHint.ts`) |
| Which filter sections are open, "Vis alle" (`open`, `showAll`) | `FilterGroupSection` | Only that section cares |
| Which page is shown | The address bar (React Router) | So the back button, bookmarks and reload work |

Everything else (grams, steps, labels, the filtered recipes, the counts in the filter panel) is **calculated from state** every time the page is drawn, never stored. *If you can calculate it, don't store it*: then it can never be out of date.

---

## 4. The tools

| Tool | What it does here | Config file |
|---|---|---|
| **React** | Builds the pages out of components | – |
| **TypeScript** | Checks that data has the right shape before the code runs. A red underline in the editor is TypeScript catching a mistake | `tsconfig*.json` |
| **Vite** | Runs the dev server (`npm run dev`) and builds the finished site (`npm run build`) | `vite.config.ts` |
| **React Router** | Connects addresses to pages, loads their data first (loaders), and gives you `Link`, `NavLink` and `useLoaderData` | set up in `main.tsx` and `routes.tsx` |
| **Tailwind CSS** | Styling with classes directly in the JSX (`className="mt-4 text-sm"`) | `src/index.css` (fonts in `@theme`) |
| **Vitest** | Runs the tests in `*.test.ts` (in `src/` and `api/`) | uses `vite.config.ts` |
| **Vercel** | Hosts the site, and runs the functions in `api/`. `vercel dev` runs both on your Mac (port 3000) | `vercel.json`, the Environment Variables in Vercel's dashboard |
| **Oxlint** | Finds common mistakes and bad habits | `.oxlintrc.json` |
| **Prettier** | Formats the code the same way everywhere (`npm run format`). `src/`, `api/` and `scripts/`; the docs are left as written | `.prettierrc.json` (Prettier's defaults), `.prettierignore` |

Fonts (Anton and IBM Plex Mono) are loaded from Google Fonts in `index.html`.

---

## 5. The admin mode in one picture

```
You (phone or Mac)                    The site (browser)                      Vercel                 Sanity
──────────────────                    ──────────────────                      ──────                 ──────
Log in at /logg-inn ───────────────►  Firebase (Google) gives a token,
                                      and the note "innlogget" is written
«+ Ny oppskrift» (admin bar) ──────►  /ny-oppskrift → newRecipeAction ──┐
«Rediger» on a recipe ─────────────►  RecipeEditor → readForm →         │
                                      only the changes ─────────────────┤
                                                                         ▼
                                      admin/api.ts → adminFetch ──► api/ (checks the token:
                                      (Bearer <token>)                  only ADMIN_UID) ──────► writes, with
                                                                                                the write token
                                      The page reads again, straight
                                      from Sanity (not the CDN) ◄──────────────────────────────── published at once
```

- **Two kinds of "logged in":** the note in the browser only decides what's *shown* (the admin bar, «Rediger», fresh data). The API's lock decides what's *allowed*, and it checks the real token. Faking the note shows the buttons, but saving fails.
- **Visitors never download** the editor, the admin pages or Firebase: they're separate files, loaded only when used.
- **The Studio still works** as a backup, on the same data.


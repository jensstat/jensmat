# 01 – Architecture: the big picture

This file explains **how the pieces fit together**. If you only read one documentation file, read this one.

---

## 1. From the address bar to the screen

What happens when you open `localhost:5173/oppskrifter/laksewrap`:

```
index.html            The only HTML file. Has an empty <div id="root"> and loads main.tsx.
   │
   ▼
src/main.tsx          Starts React and draws <App /> into #root.
   │                  Wraps everything in <BrowserRouter>, which follows the address bar.
   ▼
src/App.tsx           The frame that's the same on every page:
   │                    <Header />  →  <main> with the current page  →  <Footer />
   │                  <Routes> picks the page that matches the address:
   │                    /                  → HomePage
   │                    /pizza             → PizzaCalculatorPage
   │                    /oppskrifter/:id   → RecipePage   (:id = "laksewrap")
   │                    *  (anything else) → NotFoundPage
   ▼
src/pages/RecipePage.tsx
   │                  Reads "laksewrap" from the address, asks the data layer for that recipe,
   │                  and puts the page together from smaller components.
   ▼
src/components/…      The building blocks: IngredientList, StepList, PortionStepper …
```

**Key idea:** there's only one real HTML page. React swaps the content inside `<main>` when the address changes. That's why the site feels instant, and why links use `<Link>` instead of `<a href>`: an `<a>` would reload everything from scratch.

---

## 2. The folders, and why they're split this way

```
src/
├── main.tsx, App.tsx, index.css     Start-up, the frame and routes, global styles
│
├── pages/          ONE FILE PER ADDRESS. Puts a whole page together, and holds its state.
│                   HomePage, PizzaCalculatorPage, RecipePage, NotFoundPage
│
├── components/     UI BUILDING BLOCKS. Get data through props, report changes through onChange.
│   │               Header, Footer, Container, the input fields, ResultPanel, Instructions
│   └── recipe/     Building blocks used only by recipes: IngredientList, StepList …
│
├── pizza/          PIZZA KNOWLEDGE. Plain TypeScript, no React: settings, maths, yeast chart, method.
│                   Each file has a .test.ts next to it.
│
└── recipes/        RECIPE KNOWLEDGE. Plain TypeScript, no React: what a recipe is, the data,
                    the data layer, and how things are shown as text.
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
| Which page is shown | The address bar (React Router) | So the back button, bookmarks and reload work |

Everything else (grams, steps, labels) is **calculated from state** every time the page is drawn, never stored. *If you can calculate it, don't store it*: then it can never be out of date.

---

## 4. The tools

| Tool | What it does here | Config file |
|---|---|---|
| **React** | Builds the pages out of components | – |
| **TypeScript** | Checks that data has the right shape before the code runs. A red underline in the editor is TypeScript catching a mistake | `tsconfig*.json` |
| **Vite** | Runs the dev server (`npm run dev`) and builds the finished site (`npm run build`) | `vite.config.ts` |
| **React Router** | Connects addresses to pages, and gives you `Link`, `NavLink` and `useParams` | set up in `main.tsx` and `App.tsx` |
| **Tailwind CSS** | Styling with classes directly in the JSX (`className="mt-4 text-sm"`) | `src/index.css` (fonts in `@theme`) |
| **Vitest** | Runs the tests in `*.test.ts` | uses `vite.config.ts` |
| **Oxlint** | Finds common mistakes and bad habits | `.oxlintrc.json` |

Fonts (Anton and IBM Plex Mono) are loaded from Google Fonts in `index.html`.

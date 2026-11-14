# Jens matnettside 🍕

A personal food website, built to learn React while making something useful:

- **Pizzakalkulator** (`/pizza`): choose pizza type, number, rise time and temperature, and get grams, a method and clock times.
- **Oppskrifter** (`/oppskrifter`): an overview of my recipes, with a suggestion for the day, search, a filter panel (meal, main ingredient, time, difficulty, cuisine, with/without ingredients …) and grid/list view, and a page per recipe with portions, ingredients and steps. A "Datasjekk" (`/oppskrifter/datasjekk`) shows which recipes are missing information.
- **The admin mode** (only for me, after logging in at `/logg-inn`): post a recipe quickly from the phone (a title and a photo), and edit everything with «Rediger» on the recipe page. The recipes are stored in Sanity, written through the site's own API in `api/` on Vercel.

The site's text is in Norwegian. Code, comments and documentation are in English.

---

## Getting started

You need [Node.js](https://nodejs.org) installed.

```bash
npm install      # install dependencies (first time, and after pulling new packages)
npm run dev      # start the dev server, usually http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the development server. The page updates by itself when you save |
| `npm test` | Runs all the tests once |
| `npm run test:watch` | Runs the tests again every time you save |
| `npm run lint` | Finds common mistakes in the code |
| `npm run format` | Formats all the code in `src/`, `api/` and `scripts/` the same way (Prettier): line breaks, quotes, commas |
| `npm run format:check` | Only checks the formatting, without changing anything |
| `npm run build` | Checks the TypeScript types, then builds the finished site into `dist/` |
| `npm run preview` | Shows the built site locally |
| `vercel dev` | Runs the site **and** the API (`api/`) together, at http://localhost:3000. Needed for logging in and saving |
| `npm run test:api` | Tests the API for real (with `vercel dev` running, or online with `API_URL=…`). Makes test recipes and deletes them again |

**Before every commit:** `npm run format`, `npm test` and `npm run build`. If they pass, the code is formatted, the calculations are right and the types fit together.

**After pulling this change:** run `npm install` once, to get Prettier. Tip: install the Prettier extension in your editor and turn on "format on save"; it uses the same settings (`.prettierrc.json`).

---

## The documentation

Everything is in [`docs/`](docs/). Each file stands on its own, so read the one you need.

| File | Read it when you want to … |
| --- | --- |
| [01 – Architecture](docs/01-architecture.md) | understand **the big picture**: how a page gets onto the screen, and why the folders are split the way they are |
| [02 – The pizza calculator](docs/02-pizza-calculator.md) | understand the dough maths, the yeast chart, the method and the clock times |
| [03 – The recipes](docs/03-recipes.md) | understand what a recipe *is* in the code, add a recipe, or plan the CMS |
| [04 – Components](docs/04-components.md) | find a component: what it does, its props, and where it's used |
| [05 – Design](docs/05-design.md) | keep the look consistent: fonts, colours, lines, spacing, phone vs desktop |
| [06 – React and TypeScript](docs/06-react-and-typescript.md) | look up a concept (state, props, routing …) with a real example from this project |
| [07 – How to …](docs/07-how-to.md) | do a common task step by step: add a page, a field, a recipe, a test |
| [08 – Status](docs/08-status.md) | see what works, what's missing, known issues, and what's next |
| [09 – History](docs/09-history.md) | see what was built when, and **why** the code was refactored |
| [10 – Tasks](docs/10-tasks.md) | see **what to do next**, and how to start a new working session |

**New to the project, or lost track?** Read 01, then 09, then 08. That's about 15 minutes.

**Starting a new working session?** Open [10 – Tasks](docs/10-tasks.md): it says what's next, and has a ready-made opening line.

---

## Tech stack

[React 19](https://react.dev) · [TypeScript](https://www.typescriptlang.org) · [Vite](https://vite.dev) · [React Router 7](https://reactrouter.com) · [Tailwind CSS 4](https://tailwindcss.com) · [Vitest](https://vitest.dev) · [Oxlint](https://oxc.rs) · [Prettier](https://prettier.io)

What each one does, and why, is in [01 – Architecture](docs/01-architecture.md).

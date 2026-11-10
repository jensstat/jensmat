# Jens matnettside 🍕

A personal food website, built to learn React while making something useful:

- **Pizzakalkulator** (`/pizza`): choose pizza type, number, rise time and temperature, and get grams, a method and clock times.
- **Oppskrifter** (`/oppskrifter/…`): my own recipes, one page per recipe. The overview page is the next thing to build.

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
| `npm run build` | Checks the TypeScript types, then builds the finished site into `dist/` |
| `npm run preview` | Shows the built site locally |

**Before every commit:** `npm test` and `npm run build`. If both pass, the calculations are right and the types fit together.

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

**New to the project, or lost track?** Read 01, then 09, then 08. That's about 15 minutes.

---

## Tech stack

[React 19](https://react.dev) · [TypeScript](https://www.typescriptlang.org) · [Vite](https://vite.dev) · [React Router 7](https://reactrouter.com) · [Tailwind CSS 4](https://tailwindcss.com) · [Vitest](https://vitest.dev) · [Oxlint](https://oxc.rs)

What each one does, and why, is in [01 – Architecture](docs/01-architecture.md).

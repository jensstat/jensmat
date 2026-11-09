# Min matnettside 🍕

A personal food website: a recipe collection (*oppskriftsbank*) and a pizza dough calculator (*pizzakalkulator*). The site's text is in Norwegian.

## Status

Work in progress.

- **Home page** (`HomePage.tsx`): a full-height hero section with the site title.
- **Pizza calculator** (`PizzaCalculatorPage.tsx`): the two-panel layout is done, with settings on the left and a sticky result panel on the right. The hydration input works. The other fields are placeholders for now:
  - **Deig (dough):** number of pizzas, weight per dough ball, hydration
  - **Gjær og heving (yeast and rising):** yeast type, rising time, rising temperature
  - **Ekstra (extras):** salt, sugar, oil
- **Recipes:** not started yet.

Pages are switched by hand in `src/App.tsx` for now. There is no router yet, and the navigation links in the header only change which link is highlighted.

## Tech stack

- [React 19](https://react.dev) with TypeScript
- [Vite](https://vite.dev) for the dev server and builds
- [Tailwind CSS v4](https://tailwindcss.com), loaded with `@tailwindcss/vite`
- [Oxlint](https://oxc.rs) for linting

## Getting started

You need [Node.js](https://nodejs.org) installed.

```bash
npm install      # install dependencies
npm run dev      # start the dev server with hot reload
```

Then open the URL that Vite prints (usually http://localhost:5173).

## Scripts

| Command           | What it does                                    |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Starts the development server                   |
| `npm run build`   | Type-checks and builds for production (`dist/`) |
| `npm run preview` | Serves the production build locally             |
| `npm run lint`    | Runs Oxlint                                     |

## Project structure

```
src/
├── main.tsx                     # Entry point, mounts <App />
├── App.tsx                      # Page layout: Header, <main> with the current page, Footer
├── index.css                    # Tailwind import and global styles
├── components/
│   ├── Header.tsx               # Sticky header with logo and navigation
│   └── Footer.tsx               # Footer with the current year
└── pages/
    ├── HomePage.tsx             # Front page / hero
    └── PizzaCalculatorPage.tsx  # Pizza dough calculator
public/
└── favicon.svg
```

## Layout notes

- The page is at least as tall as the screen (`min-h-screen` + `flex-col`), and `<main>` grows (`flex-1`) so the footer stays at the bottom.
- `<main>` has no fixed width, so pages can have full-width backgrounds. Each page centres its own content with `max-w-6xl`, the same as the header and footer, so everything lines up.
- On large screens the pizza calculator uses a grid with a flexible settings column and a 420px result column. On phones the panels stack.

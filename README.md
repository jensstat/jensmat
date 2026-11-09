# Jens matnettside 🍕

A personal food website, built to learn React while making something useful.
Right now it has a **pizza dough calculator**. A recipe collection (*oppskriftsbank*) is planned.
The site's text is in Norwegian; code, comments and this README are in English.

This README explains **how the repo works**, so it's easy to find your way around later.
Add to it as the project grows. The places marked ✏️ are meant to be filled in over time.

---

## Contents

1. [Getting started](#1-getting-started)
2. [Tech stack](#2-tech-stack)
3. [Folder structure](#3-folder-structure)
4. [How the pizza calculator works](#4-how-the-pizza-calculator-works)
5. [Components](#5-components)
6. [Styling and design](#6-styling-and-design)
7. [How to …](#7-how-to-)
8. [React concepts used in the project](#8-react-concepts-used-in-the-project)
9. [Ideas and to-do](#9-ideas-and-to-do) ✏️
10. [Learning log](#10-learning-log) ✏️

---

## 1. Getting started

You need [Node.js](https://nodejs.org) installed.

```bash
npm install      # install dependencies (first time, and after pulling new packages)
npm run dev      # start the dev server with hot reload
```

Open the URL that Vite prints (usually http://localhost:5173). The page updates by itself when you save a file.

| Command           | What it does                                                     |
| ----------------- | ---------------------------------------------------------------- |
| `npm run dev`     | Starts the development server                                    |
| `npm run build`   | Checks the TypeScript types, then builds for production (`dist/`) |
| `npm run preview` | Serves the production build locally                              |
| `npm run lint`    | Runs Oxlint, which finds common mistakes                         |
| `npm test`        | Runs all the tests once (Vitest)                                 |
| `npm run test:watch` | Runs the tests again every time you save a file              |

**Tip:** run `npm test` and `npm run build` before committing. The tests catch broken calculations, and the build catches type errors that the dev server doesn't always show.

---

## 2. Tech stack

| Tool | What it's used for |
| --- | --- |
| [React 19](https://react.dev) | Builds the page out of components |
| [TypeScript](https://www.typescriptlang.org) | JavaScript with types: the editor warns about mistakes before you run the code |
| [Vite](https://vite.dev) | Dev server and build tool |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling with classes directly in the JSX (`className="mt-4 text-sm"`) |
| [Oxlint](https://oxc.rs) | Linter |
| [Vitest](https://vitest.dev) | Tests: small programs that check that the calculations give the right answers |

---

## 3. Folder structure

```
src/
├── main.tsx                  # Entry point: mounts <App /> into index.html
├── App.tsx                   # The frame: Header, <main> with the current page, Footer
├── index.css                 # Tailwind import + the site's fonts (@theme)
│
├── pages/                    # One file per page
│   ├── HomePage.tsx          # Front page (hero)
│   └── PizzaCalculatorPage.tsx
│
├── components/               # Building blocks for the UI
│   ├── Header.tsx / Footer.tsx
│   ├── FieldGroup.tsx        # A titled group of fields with lines between the rows
│   ├── FieldCard.tsx         # The shared row: label, box, hint
│   ├── NumberField.tsx       # Number input, built on FieldCard
│   ├── SelectField.tsx       # Dropdown, built on FieldCard
│   ├── ChoiceTags.tsx        # Clickable tags (one choice), like radio buttons
│   ├── ResultPanel.tsx       # The result: grams per ingredient
│   └── Instructions.tsx      # The method under the result, with the "Stekes kl." time field
│
└── pizza/                    # "Pizza knowledge": data and maths, no React
    ├── settings.ts           # All settings, default values, pizza types and choices
    ├── calculateDough.ts     # Settings → grams per ingredient
    ├── yeast.ts              # How much yeast: the forum's yeast chart + lookup
    ├── method.ts             # The steps, and clock times counted back from baking
    └── *.test.ts             # Tests for each of the files above

public/                       # Files served as they are (favicon)
index.html                    # The HTML shell; loads the Google Fonts
Yeast-Chart.jpg               # The yeast chart from the forum, which yeast.ts is typed in from
```

Tests live **next to the file they test** (`yeast.ts` → `yeast.test.ts`), so it's easy to see what's covered.

**Rule of thumb for where things go:**
- **`pages/`**: what makes up a whole page, and holds its state.
- **`components/`**: reusable pieces of UI. They get data through props and report changes back through `onChange`. They don't know anything about pizza.
- **`pizza/`**: plain TypeScript with no React: data, numbers and calculations. Easy to read and test on its own.

---

## 4. How the pizza calculator works

### The flow of data

```
          pizza/settings.ts
          (defaults, pizza types, choices)
                  │
                  ▼
 ┌────────────────────────────────────────┐
 │ PizzaCalculatorPage                    │
 │                                        │
 │  settings ← useState(defaults)         │
 │      │                                 │
 │      ├──▶ fields (value) ──┐           │
 │      │                     │ you type  │
 │      │     update({...}) ◀─┘ (onChange)│
 │      │                                 │
 │      └──▶ calculateDough(settings)     │
 │                  │  (uses pizza/yeast) │
 │                  ▼                     │
 │               rows ──▶ ResultPanel     │
 │      settings ───────▶ Instructions    │
 └────────────────────────────────────────┘
```

1. The page holds **one** state object, `settings`, with every value from the fields.
2. Each field shows its value from `settings` and calls `update({ … })` when you type.
3. React draws the page again, and `calculateDough(settings)` works out the grams.
4. `ResultPanel` shows the grams, and `Instructions` builds the steps from the same settings.

The result is **calculated on every render** and never stored in state. Rule: *if you can calculate it, don't store it.*

### The maths: baker's percentages

Everything is given as a **percentage of the flour weight**. 61% hydration means water = 61% of the flour.

```
total dough = number of pizzas × weight per ball
flour       = total dough ÷ ((100 + water% + salt% + sugar% + oil% + yeast%) / 100)
ingredient  = flour × ingredient% / 100
```

The house recipe (450 g flour, 275 g water, 10 g salt, 5 g sugar, 3 g instant yeast, 2 pizzas) is the default, so you can always check that the calculation gives it back.

### The yeast (`pizza/yeast.ts`)

The amount of yeast is **worked out from rise time and temperature**, never typed in. Everything is in instant dry yeast (IDY) and converted to fresh yeast with `yeastStrength` (fresh = 3.125×, from the chart).

**The chart** (`chartRows`) is TXCraig1's yeast prediction model from the [Pizza Making Forum](https://www.pizzamaking.com/forum/index.php?topic=26831.0) (reply #261), typed in from `Yeast-Chart.jpg`:
- **Columns:** yeast amount (IDY %). **Rows:** temperature (°F). **Cells:** hours until the dough is ready.
- The chart goes from yeast → hours, but the calculator needs hours → yeast, so `idyPercentFromChart` reads a row "backwards".
- Between the chart's points, it draws straight lines on a **log scale**. Yeast and time change by multiplying, so that gives a smooth curve. Between two rows (°F), it takes the in-between value.
- Outside the chart (very short or very long rises), the nearest line is continued. That's a guess, so treat extreme settings with care. A 3-hour rise in the fridge, for example, gives an absurd amount of yeast.

**The two ways** the user switches between with the "Gjærberegning" (yeast calculation) tags:
- **Forum-basert:** the chart as it is. The house recipe would get about 1 g of yeast.
- **Hjemmeoppskrift:** the same curve, scaled (`houseFactor`, about 3.1×) so the house recipe (3 h at 24 °C) gives exactly 3 g. Long, cold rises get a lot of yeast this way.

### The method (`pizza/method.ts`)

`makeSteps` builds the steps from the settings: 10 min mixing, 30 min rest, then the rest of the rise time split 60 % / 40 % between the first rise and the rise in balls. Each step knows how many minutes before baking it starts, so `stepClock` can count back from "Stekes kl." to clock times. At 10 °C or below, it's treated as a fridge rise, with an extra step to take the balls out 1.5 h before baking.

### Tests

`npm test` runs the tests in `src/pizza/*.test.ts`. They check, among other things:
- that the chart is typed in correctly (every row and column must fall, so a misread number fails)
- that the default settings give back the house recipe (451 / 275 / 10 / 5 / 3 g)
- that the house method gives the right clock times for baking at 18:00

If a test fails after a change, either the change broke something, or the test needs updating because the behaviour was *meant* to change.

### The pizza types

`pizzaStyles` in `settings.ts` has one entry per type, with name, hint and starting values. Choosing a type copies its values into `settings`, and everything can still be adjusted afterwards.

---

## 5. Components

| Component | Props (the most important) | What it does |
| --- | --- | --- |
| `FieldGroup` | `title`, `children` | Heading + a list of fields with lines between them |
| `FieldCard` | `label`, `hint?`, `children` | The shared row layout. Phones: label on top. From `sm`: label left, box right |
| `NumberField` | `label`, `unit`, `value`, `onChange`, `min`, `max`, `step`, `hint?` | Number input. An empty field gives `NaN`, which is shown as empty |
| `SelectField` | `label`, `options`, `value`, `onChange`, `hint?` | Dropdown with its own arrow |
| `ChoiceTags` | `label`, `options`, `value`, `onChange`, `hint?` | Tags for one choice. Real radio buttons underneath, so the keyboard works |
| `ResultPanel` | `rows`, `pizzaCount`, `ballWeight` | Phones: black box. Desktop: a list like the fields |
| `Instructions` | `pizzaCount`, `ballWeight`, `riseHours`, `riseTemp` | The steps, with times and amounts from the settings |

All the fields are **controlled**: they get `value` from the page and report back with `onChange`. They never hold their own state.

---

## 6. Styling and design

- **Fonts** (loaded in `index.html`, registered in `index.css`):
  - `font-display`: **Anton**, for headings and big numbers
  - `font-mono`: **IBM Plex Mono**, for everything else
- **Colours:** black and white, neutral gray (`neutral-*`) for lines and hints, and **one accent colour: red** (`red-600`), used sparingly (focus on fields, hover in the menu).
- **Lines:** square corners, 1px black borders on the input boxes, light gray lines (`neutral-200`) between rows.
- **Width:** everything is centred with `mx-auto max-w-6xl px-4 md:px-8`, the same in the header, the pages and the footer, so everything lines up.
- **Mobile first:** classes without a prefix apply to phones. `sm:`, `md:` and `lg:` override them on bigger screens. Example: `ResultPanel` is a black box on phones, and `lg:bg-transparent` turns it into a list on desktop.

---

## 7. How to …

### … add a new number field

1. Add the field to `PizzaSettings` and `defaults` in `pizza/settings.ts`.
2. Add a `<NumberField … />` in the right `FieldGroup` in `PizzaCalculatorPage.tsx`:
   ```tsx
   <NumberField
     label="Navn"
     unit="%"
     value={settings.myField}
     onChange={(myField) => update({ myField })}
     min={0}
     max={10}
     step={0.1}
   />
   ```
3. Use the value in `calculateDough.ts` if it affects the grams. Remember to add it to the `NaN` check at the top.

### … add a new pizza type

Add an entry to `pizzaStyles` in `pizza/settings.ts`. The dropdown updates by itself.

### … change the yeast calculation

Everything is in `pizza/yeast.ts`. Run `npm test` afterwards: the tests check the chart, and that the house recipe still gives 3 g with "Hjemmeoppskrift".

### … switch which page is shown

For now, by hand in `App.tsx`: comment the page in or out. (Replaced by React Router later.)

✏️ *Add more "how to"s as you learn them.*

---

## 8. React concepts used in the project

| Concept | Where | In short |
| --- | --- | --- |
| Components and props | everywhere | Functions that return JSX. Props are their "settings" |
| `children` | `FieldCard`, `FieldGroup` | What you put *between* `<Tag>` and `</Tag>` |
| `useState` | `PizzaCalculatorPage`, `Header` | Values React remembers between renders. Changing them redraws the page |
| Controlled inputs | `NumberField`, `SelectField`, `ChoiceTags` | `value` + `onChange`: React owns the value, not the browser |
| Lifting state up | `PizzaCalculatorPage` | The state lives in the page, because both the fields and the result need it |
| Never change state directly | `update()` | Always make a new object (`{ ...prev, ...changes }`) |
| Derived values | `calculateDough`, `makeSteps` | Calculated from state on each render, not stored |
| Lists with `.map()` and `key` | `ResultPanel`, `Instructions`, `Header` | Turn data into elements |
| Conditional rendering | `hint && …`, `rows.length === 0 ? … : …` | Show something only when a condition is true |
| `useId` | `ChoiceTags` | Unique ids that connect labels and fields |
| State where it's used | `Instructions` (`bakeTime`) | Only the method needs the baking time, so the state lives there, not in the page |
| `useState(() => …)` | `Instructions` (`today`) | Runs the function only the first time. Keeps "impure" things like `new Date()` out of each render |
| `Partial<T>`, `Record<K, V>` | `settings.ts`, `yeast.ts` | TypeScript: "some of the fields" / "an object with these keys" |

---

## 9. Ideas and to-do

- [x] Enter the real yeast chart from the forum (reply #261)
- [ ] The 48 h+ chart (reply #406), for long rises past the end of the chart
- [ ] Sourdough: a proper calculation (the starter's flour and water must be subtracted). Hidden for now
- [x] The method: for fridge rises, "take the balls out before baking"
- [x] "Ready at …" schedule: clock times for each step
- [x] Tests with Vitest
- [ ] Test-bake "Forum-basert" vs "Hjemmeoppskrift", and adjust
- [ ] Remember the settings with `localStorage`
- [ ] Share a recipe as a link (settings in the URL)
- [ ] React Router: make the menu work, one address per page
- [ ] The recipe collection (*Oppskrifter*)
- [ ] Publish the site (Netlify / Vercel / GitHub Pages)

---

## 10. Learning log

Short notes on things that were hard or surprising, so they're easy to look up later.

- **Tailwind ignores misspelled classes without any warning.** `text-neutral-560`, `divide-netural-200` and `rounded-x` just did nothing. If a style doesn't show up, check the spelling first.
- **`sticky` in a grid needs `self-start`.** Otherwise the element stretches to the full height of the row and has nowhere to move.
- **A grid only places its direct children.** A `</div>` in the wrong place moved the result box under the fields.
- **Empty number fields give `NaN`.** It has to be handled both in the field (show empty) and in the calculation (no result).
- **Same number, same alignment.** The lines in the two columns line up because `mb-4` on the field headings matches `mt-4` on the result list.
- ✏️ *Add your own …*

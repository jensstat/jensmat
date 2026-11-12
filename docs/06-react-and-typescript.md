# 06 – React and TypeScript, with examples from this project

Every concept used in the project, explained briefly, with **where to find a real example**. Open the file next to this one and look.

---

## React

### Components and props
A component is a **function that returns JSX** (HTML-like code). The name must start with a capital letter. Props are the component's "settings", given like HTML attributes.
```tsx
<NumberField label="Salt" unit="%" value={settings.salt} … />
```
📁 Every file in `components/`. Simple start: `components/recipe/StepList.tsx`.

### `children`
What you put *between* `<Tag>` and `</Tag>` arrives as the `children` prop. That's how one shell can wrap different content.
📁 `FieldCard.tsx` (wraps an input or a select), `Container.tsx`, `FieldGroup.tsx`.

### `useState`: values React remembers
```tsx
const [settings, setSettings] = useState(defaults);
```
`settings` is the value now. `setSettings` changes it **and** makes React draw the component again.
📁 `PizzaCalculatorPage.tsx`, `Instructions.tsx`.

### Never change state directly
Always make a **new** object; React only notices a change when it gets a new one.
```tsx
setSettings((prev) => ({ ...prev, salt: 3 }));   // ✅ new object
settings.salt = 3;                                // ❌ React doesn't notice
```
`...prev` (the "spread" operator) copies all the old values into the new object.
📁 `update()` in `PizzaCalculatorPage.tsx`.

The same goes for objects inside objects: **copy every level that changes.**
```ts
{ ...filters, chosen: { ...filters.chosen, [groupId]: newTicked } }
```
📁 `toggleOption` in `recipes/filter.ts`. (`[groupId]:` is a *computed key*: the value of `groupId`, like `"protein"`, becomes the key.)

### Controlled inputs
The field gets its value **from** state (`value`) and reports changes **to** it (`onChange`). React owns the value, not the browser.
📁 `NumberField.tsx`, `SelectField.tsx`, `ChoiceTags.tsx`.

### Lifting state up
When two components need the same data, the state lives in their common parent and is passed down.
📁 The pizza settings live in `PizzaCalculatorPage`, because both the fields and `ResultPanel` need them.

### State where it's used
The opposite rule: if only one component needs it, keep it there.
📁 `bakeTime` in `Instructions.tsx`.

### Derived values: calculate, don't store
If something can be calculated from state, calculate it on every render instead of storing it. Then it can never be out of date.
📁 `const rows = calculateDough(settings)` in `PizzaCalculatorPage.tsx`, and `isQuick()` in `recipes/types.ts`.

### `useState(() => …)`: run something only the first time
📁 `const [today] = useState(() => new Date())` in `Instructions.tsx`. Calling `new Date()` directly would give a new answer on every render, which React (and the linter) want to avoid.

### Lists: `.map()` and `key`
`.map()` turns a list of data into a list of elements. Each element needs a unique `key`, so React can keep track of them. Use an id if there is one. Use the position (`index`) only if the list never changes order.
📁 `ResultPanel.tsx` (`key={row.label}`), `IngredientList.tsx` (`key={index}`, since the same mustard appears twice).

### Conditional rendering
```tsx
{hint && <span>{hint}</span>}                 // show only if there's a hint
{rows.length === 0 ? <p>…</p> : <dl>…</dl>}   // one or the other
```
📁 `FieldCard.tsx`, `ResultPanel.tsx`, `RecipePage.tsx`.

### Returning early
Handle the bad case first, and return. After that, the code can assume everything is OK.
📁 `if (!recipe) return <NotFoundPage … />` in `RecipePage.tsx`, and the `NaN` check in `calculateDough.ts`.

### `key` to start a component afresh
A `key` isn't only for lists. If a component's `key` changes, React throws it away and starts a new one, with fresh state.
📁 `<RecipeView key={recipe.id} …/>` in `RecipePage.tsx`: going to another recipe resets the portion number.

### `useRef`: a handle on an element
`useRef` gives you a "handle" that points at a real element on the page, so you can call its own functions.
📁 `FilterPanel.tsx`: `dialogRef.current?.showModal()` opens the `<dialog>`, and `close()` closes it. `Header.tsx`: `headerRef` lets a `ResizeObserver` measure the header's height.

### `useId`
Makes an id that's unique on the page, to connect a label to a field.
📁 `ChoiceTags.tsx`.

### `<dialog>` and `<details>`: let the browser do the work
`<dialog>` with `showModal()` puts a panel on top, keeps Tab inside it and closes on Esc. `<details>`/`<summary>` is a heading that opens and closes, with the keyboard too. Neither needs our own code for that.
📁 `FilterPanel.tsx` (dialog), `FilterGroupSection.tsx` (details).

---

## React Router

| Piece | What it does | 📁 |
|---|---|---|
| `createBrowserRouter(routes)` + `<RouterProvider>` | Follows the address bar, and can load data before a page is shown | `main.tsx` |
| A route `{ path, element, loader }` | Shows the page whose `path` matches the address. `children` + `<Outlet />`: pages inside a frame | `routes.tsx`, `App.tsx` |
| `:id` in a path | A placeholder: one route for every recipe. The loader gets it as `params.id` | `routes.tsx`, `loaders.ts` |
| `path: "*"` | Catches every address no other route matched | `routes.tsx` |
| `loader` | A function that fetches what the page needs. The page is only shown when it's done | `loaders.ts` |
| `useLoaderData<typeof loader>()` | Reads what the loader returned, with the right type | the recipe pages |
| `useNavigation()` | `state` is `"loading"` while the next page's loader waits ("Laster…") | `App.tsx` |
| `errorElement` + `useRouteError()` | Shown instead of the page when a loader throws | `routes.tsx`, `RouteErrorPage.tsx` |
| `useRevalidator()` | `revalidate()` runs the loaders again ("Prøv igjen") | `RouteErrorPage.tsx` |
| `<ScrollRestoration />` | A new page starts at the top; back goes to where you were | `App.tsx` |
| `<Link to>` | A link that changes page without reloading the site | `HomePage.tsx`, `RecipePage.tsx` |
| `<NavLink>` | A `Link` that knows whether it's the current page (`isActive`) | `Header.tsx` |

---

## TypeScript

| Concept | Example | 📁 |
|---|---|---|
| `interface` | Describes the shape of an object: `interface Recipe { title: string; … }` | `recipes/types.ts` |
| `?` (optional) | `image?: string`: the field can be missing | `recipes/types.ts` |
| Function types | `onChange: (value: number) => void`: "a function that takes a number and returns nothing" | `NumberField.tsx` |
| Union types | `"Middag" \| "Dessert"`: exactly one of these values | `recipes/types.ts` |
| `as const` + `(typeof x)[number]` | Writes a list once, and gets both the list and a union type from it | `recipes/types.ts` |
| `group?` + grouping | Optional fields can describe structure too: `groupIngredients` turns `group` into headings | `recipes/display.ts` |
| `Partial<T>` | "Some of the fields in T": used by `update({ salt: 3 })` | `PizzaCalculatorPage.tsx` |
| `Record<K, V>` | "An object with keys K and values V": `yeastStrength` | `pizza/yeast.ts` |
| `Partial<Record<string, string[]>>` | "Any text key, maybe missing, with a list of text": the ticked options per filter group | `recipes/filter.ts` (`chosen`) |
| Functions in an object | `matches: (recipe, option) => …`: a field can hold a function, so each filter group carries its own rule | `recipes/filter.ts` (`filterGroups`) |
| `import type` | Imports only a type (it disappears when the code runs) | everywhere |

---

## JavaScript worth knowing

| Concept | Example | 📁 |
|---|---|---|
| Template strings | `` `${count} pizzaer` ``: text with values inserted | `method.ts`, `Header.tsx` |
| Spread `...` | `{ ...prev, ...changes }`, `[...recipes]`: copy into a new object/list | `PizzaCalculatorPage.tsx`, `recipes.ts` |
| `?.` (optional chaining) | `a?.b`: "b, if a exists" | `settings.ts` (`yeastModelHint`) |
| `??` | `a ?? b`: "a, or b if a is missing" | `yeast.ts` |
| `.map` / `.filter` / `.find` / `.some` / `.reduce` | Transform, filter, find one, "is any …?", combine | `calculateDough.ts`, `recipes.ts`, the tests |
| `Object.entries` | `{ a: 1 }` → `[["a", 1]]`, so an object can be `.map()`-ed | `pizza/settings.ts` |
| `.flatMap` | Like `.map`, but a list of lists becomes one list | `ingredientNames` in `recipes/filter.ts` |
| `new Set(list)` + `[...set]` | A list without duplicates | `ingredientNames` |
| `.localeCompare(b, "nb")` | Sorts text the Norwegian way (æ, ø, å last) | `ingredientNames`, `recipes.ts` |
| `.every` / `.some` | "Are all …?" / "Is any …?": "and" between filter groups, "or" within one | `filterRecipes` |

---

## Learning log ✏️

Things that were hard or surprising along the way. Add your own.

- **Tailwind ignores misspelled classes without any warning.** `text-neutral-560`, `divide-netural-200` and `rounded-x` just did nothing. If a style doesn't show up, check the spelling first.
- **A grid only places its direct children.** A `</div>` in the wrong place moved the result box under the fields. On the front page, the heading and subtitle became two columns because they weren't wrapped in one element.
- **`mx-auto` in a flex column shrinks the box.** It needs `w-full` to stay full width (the front page).
- **`sticky` in a grid needs `self-start`.** Otherwise the element is as tall as the row and has nowhere to move.
- **Empty number fields give `NaN`.** It has to be handled both in the field (show empty) and in the calculation (no result).
- **A component must return something.** `function RecipePage() {}` returns nothing, and TypeScript says `'() => void' is not a valid JSX element type`. The last line of a TypeScript error is often the most useful.
- **Order in the code = order on phones.** With grid placement (`lg:col-start-2 lg:row-span-2`), the same three parts can be arranged differently on desktop, without writing them twice (the recipe page).
- **Use what the browser already has.** `<dialog>` with `showModal()` gives a full-screen panel with Esc and keyboard handling for free (the ingredient menu on phones).
- **Same number, same alignment.** Lines in two columns line up when the spacing above them is the same.
- **A scroll area in a flex column needs `min-h-0`.** Flex items won't shrink below their content by default, so `overflow-y-auto` never kicks in (the filter panel on phones).
- **`margin: auto` on one side pushes a dialog to the other.** A modal `<dialog>` is centred by `margin: auto`; `mt-auto` makes it a sheet at the bottom, `ml-auto` a panel on the right.
- **Animating something that appears needs a first frame.** A closed dialog is `display: none`, so `starting:` (`@starting-style`) gives the slide its start, and `transition-discrete` lets it finish before it disappears.
- **Every phone class needs an `lg:` partner in the same state.** `starting:open:translate-y-full` without `lg:starting:open:translate-y-0` made the desktop panel slide in diagonally.
- **Files in `public/` are reached from the root:** `public/pizza.avif` → `src="/pizza.avif"`. Without the `/`, the path is relative to the current address and breaks on sub-pages.

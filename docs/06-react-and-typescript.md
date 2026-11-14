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

### `useEffect`: reaching outside React, and cleaning up
Rendering should only *calculate* what to show. Anything that reaches outside React (listening to scrolling, measuring an element, asking the browser to keep the screen on, saving to `localStorage`) goes in `useEffect`, which runs after the screen is drawn. The function it **returns** is the cleanup: it runs before the effect runs again and when the component disappears, so listeners are removed and locks let go.
```tsx
useEffect(() => {
  window.addEventListener("scroll", update, { passive: true });
  return () => window.removeEventListener("scroll", update); // cleanup
}, [key]); // run again only when key changes
```
📁 `Header.tsx` (a `ResizeObserver` measures the header into `--header-height`), `RecipeSectionNav.tsx` (scroll), `useWakeLock.ts` (keep the screen on, and ask again when the page is visible).

### Your own hooks
A function whose name starts with `use` and that uses other hooks is a **hook** of your own: a piece of state + effects that a component can use in one line. `useWakeLock()` works like `useState(false)`, but while it's `true` the screen stays on.
📁 `useWakeLock.ts` (used by `KeepScreenOn`), `useActiveSection` in `RecipeSectionNav.tsx`.

---

### `React.lazy` + `<Suspense>`: a component in its own file
`lazy(() => import("./RecipeEditor"))` makes a component that's downloaded the first time it's drawn. `<Suspense fallback={…}>` around it shows something meanwhile. Visitors who never press «Rediger» never download it.
📁 `RecipePage.tsx` (the editor). For whole pages, React Router's `lazy` on a route does the same (`routes.tsx`).

### `useSyncExternalStore`: following something outside React
For a value that lives outside React and can change (here `localStorage`): give it a way to *subscribe* to changes and a way to *read* the value now, and the component draws again when it changes.
```ts
useSyncExternalStore(subscribe, hasLoginHint) // true/false, kept up to date
```
📁 `auth/loginHint.ts` (`useLoginHint`: the admin bar appears the moment you log in).

### `useCallback`: the same function every render
A function written inside a component is a new function every render. Passed on as a prop that an effect depends on, the effect would run every time. `useCallback(fn, [deps])` keeps the same function until the deps change.
📁 `RecipeEditor.tsx` (`recount`, given to the list fields), `useNotice.ts`.

### Forms without `useState` per field: `FormData`
Fields can keep their own value (`defaultValue`), and the form is read when needed: `new FormData(form)`, then `get("title")`, or `getAll("steps")` for several fields with the same `name` (a list). A `<input type="file">` gives a `File`.
📁 `admin/readForm.ts` (the whole editor), `admin/newRecipeAction.ts`.

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
| `useRevalidator()` | `revalidate()` runs the loaders again ("Prøv igjen", and after «Lagre» so the page shows what was saved) | `RouteErrorPage.tsx`, `RecipeEditor.tsx` |
| `lazy` on a route | The page (and what only it uses, like Firebase) is its own file, downloaded when the address is first opened | `routes.tsx` (`/logg-inn`, `/ny-oppskrift`) |
| `action` + `<Form method="post">` | The loader's sibling: runs when the form is sent. Returns `redirect(…)` to go on, or data for the page | `admin/newRecipeAction.ts`, `NewRecipePage.tsx` |
| `useActionData()` | What the action returned (an error message) | `NewRecipePage.tsx` |
| `useNavigation().formData` | What's being sent right now, so the pressed button can say «Lagrer …» | `NewRecipePage.tsx` |
| `useSearchParams()` | Reads and writes the `?…` part. `{ replace: true }` doesn't add a step to the history; `state` keeps the link state | `RecipeListPage.tsx`, `RecipePage.tsx` (`?rediger`) |
| `shouldRevalidate` | Decides whether a loader runs again; here not when only the `?…` part changed | `routes.tsx` |
| `useBlocker(fn)` | Stops a move to another page while `fn` says so, and lets you ask first (`proceed` / `reset`) | `RecipeEditor.tsx` |
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
- **Use what the browser already has.** `<dialog>` with `showModal()` gives a panel on top with Esc and keyboard handling for free (the filter panel).
- **Same number, same alignment.** Lines in two columns line up when the spacing above them is the same.
- **A scroll area in a flex column needs `min-h-0`.** Flex items won't shrink below their content by default, so `overflow-y-auto` never kicks in (the filter panel on phones).
- **`margin: auto` on one side pushes a dialog to the other.** A modal `<dialog>` is centred by `margin: auto`; `mt-auto` makes it a sheet at the bottom, `ml-auto` a panel on the right.
- **Animating something that appears needs a first frame.** A closed dialog is `display: none`, so `starting:` (`@starting-style`) gives the slide its start, and `transition-discrete` lets it finish before it disappears.
- **Every phone class needs an `lg:` partner in the same state.** `starting:open:translate-y-full` without `lg:starting:open:translate-y-0` made the desktop panel slide in diagonally.
- **Files in `public/` are reached from the root:** `public/pizza.avif` → `src="/pizza.avif"`. Without the `/`, the path is relative to the current address and breaks on sub-pages.
- **A CSS variable can be set from JavaScript.** `document.documentElement.style.setProperty("--header-height", "119px")`, and Tailwind reads it with `top-[var(--header-height)]`. Measure once, use anywhere (the header, the recipe page's sticky parts).
- **`row-span` + a `1fr` row keeps a grid calm.** When one item spans several rows and is taller than them, the extra height goes to the `1fr` row instead of spreading out the others (the top of the overview).
- **`w-fit` makes a box as wide as its widest child.** Put the search and the chips in one `w-fit` box, and the search ends where the chips end.
- **`scroll-mt-…` keeps a heading out from under sticky bars** when you jump to it with `scrollIntoView`.
- **A grid column is as wide as its widest content** unless it's `minmax(0, 1fr)`. A row of buttons made the recipe page scroll sideways on phones until the grid got `grid-cols-[minmax(0,1fr)]`.
- **A bare `/` inside `[…]` breaks a field's `pattern`,** and the browser then quietly ignores it. Browsers read `pattern` with strict rules; write `\/`. Only a test in the browser showed it.
- **Two classes for the same thing (`w-full` and `w-44`) on one element:** which wins depends on Tailwind's order, not yours. Keep sizes out of shared styles.
- **Rounding is for showing, not for editing.** `formatAmount` (0.15 → «0,2») in a field would have changed the amounts every time they were saved.
- **In development, effects run twice** (React's StrictMode, on purpose, to catch missing cleanups). Two requests in the Network tab can be one in the real build.
- **A hint isn't proof.** The login note in `localStorage` only decides what's *shown*; the server checks the real token before anything is *written*.

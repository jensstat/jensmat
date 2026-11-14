# 04 – Components

A catalogue of every component: what it does, its props, and where it's used. **Props marked `?` are optional.**

A component **gets** data through props, and **reports** changes back through a function prop (usually `onChange`). None of the components below hold the important data themselves; that's the page's job.

---

## Pages (`src/pages/`)

One per address. A page puts components together and holds the state for that page.

| Page | Address | What it does |
|---|---|---|
| `HomePage` | `/` | Big heading, subtitle, and two buttons: "Oppskrifter" and "Pizzakalkulator" |
| `PizzaCalculatorPage` | `/pizza` | Holds the pizza `settings` in state, and draws the fields, the result and the method. See [02](02-pizza-calculator.md) |
| `RecipeListPage` | `/oppskrifter` | The overview: "Hva med…?" (on the right from lg), search, the filter panel, meal chips, the chosen filters, grid/list toggle, recipe cards. Holds `view`, `day` and `suggestion` in state; the search and the filters are in the address. See [03](03-recipes.md), section 6 |
| `RecipePage` | `/oppskrifter/:id` | One recipe: a side panel for the ingredients on desktop; on phones the ingredients in the page, a section bar and cooking mode. See [03](03-recipes.md), section 5 |
| `DataCheckPage` | `/oppskrifter/datasjekk` | The Datasjekk: every recipe and what it's missing. In the admin bar, not in the menu. Rules in `recipes/completeness.ts`. Logged in: «Rediger» links, also to each missing field |
| `NewRecipePage` | `/ny-oppskrift` | The admin's quick way to post: a title and maybe a photo, «Lagre» or «Lagre og fyll ut resten». What «Lagre» does is `admin/newRecipeAction.ts`. Checks the real login (`useUser`). Loaded with `lazy` |
| `LoginPage` | `/logg-inn` | «Logg inn med Google», then your name, user id and «Logg ut» (`auth/session.ts`). Loaded with `lazy` |
| `NotFoundPage` | everything else | "Fant ikke siden". Props: `title?`, `message?`. Also used by `RecipePage` for unknown recipes |

---

## Shared on every page

### `Header`
The logo and the menu, and the admin bar on top when you're logged in (`useLoginHint`). **No props.**
- Uses `NavLink`, which knows whether it points to the current page, and then gets a black underline and `aria-current` (for screen readers).
- `end` on "Hjem" stops it from being active on every page (every address starts with `/`).
- On phones, the logo and menu are stacked; from `md:`, they're side by side.
- **Measures its own height** (`ResizeObserver`) into the CSS variable `--header-height`, so things that stick under it know where to stop: the recipe page's section bar (phones) and ingredient panel (desktop).

### `AdminBar`
A thin dark bar at the very top, only for the admin: `Admin · + Ny oppskrift · Datasjekk · Logg ut`. Inside `Header`, so it sticks with it and is counted in `--header-height`. «Logg ut» uses `auth/session.ts`, which loads Firebase only then. **No props.**

### `Notice` (and `useNotice`)
A short message at the bottom of the screen («Lagret ✓», ««Laksewrap» er slettet»), with `role="status"` so screen readers read it. `useNotice(initial?, seconds = 3)` gives `[message, show]`; the message disappears by itself.

| Prop | Type |
|---|---|
| `message` | text |

### `Footer`
"© year Jens matnettside". **No props.** The year is worked out once, outside the component.

### `Container`
The shared page width: centred, `max-w-7xl`, with the same side padding as the header, so content lines up with the logo.

| Prop | Type | |
|---|---|---|
| `children` | anything | the content |

Used by: `PizzaCalculatorPage`, `NotFoundPage`, `RouteErrorPage`. (`HomePage` and `RecipeListPage` write the same width with their own vertical padding, and `RecipePage` has the same width, but its own two-column layout.)

### Icons (`icons.tsx`)
Small line icons, drawn on a 24×24 grid in the text colour: `CloseIcon` (✕), `CheckIcon` (✓), `ChevronDownIcon`, `FilterIcon`, `SearchIcon`. Each takes only `className?` (the size, e.g. `"h-5 w-5"`, and maybe a colour). They're hidden from screen readers; the button around them carries the words.

### `focusRing` (`focusRing.ts`)
Not a component, but a string of classes: a dark ring around whatever the keyboard is on (`focus-visible:`). Add it to a button: `` className={`… ${focusRing}`} ``. Used in the filter panel and the chosen-filter chips.

---

## The input fields (pizza calculator)

They all follow the same pattern: **`value` in, `onChange` out** ("controlled inputs"). They don't remember anything themselves.

### `FieldGroup`
A heading, and a list of fields with thin gray lines between them.

| Prop | Type | |
|---|---|---|
| `title` | text | "Deig", "Gjær og heving" … |
| `children` | fields | the fields in the group |

### `FieldCard`
**The shared row layout** that the fields below are built on: label, a black box, and an optional hint under it. Phones: label above. From `sm:`: label on the left, box on the right (16rem).

| Prop | Type | |
|---|---|---|
| `label` | text | |
| `hint?` | text | gray text under the box |
| `children` | the field itself | the input or the select |

### `NumberField`
A number input, built on `FieldCard`. An empty field is `NaN`, and is shown as empty.

| Prop | Type | |
|---|---|---|
| `label`, `unit` | text | "Hydrering", "%" |
| `value` | number | |
| `onChange` | `(value: number) => void` | called with the new number |
| `min`, `max`, `step` | number | |
| `hint?` | text | |

### `SelectField`
A dropdown with its own arrow, built on `FieldCard`.

| Prop | Type | |
|---|---|---|
| `label` | text | |
| `options` | `SelectOption[]` | `{ value, label }` (the type is in `pizza/settings.ts`). `value` is what the code sees, `label` what the user sees |
| `value` | text | |
| `onChange` | `(value: string) => void` | |
| `hint?` | text | |

### `ChoiceTags`
Clickable tags where exactly one is chosen, like "Hjemmeoppskrift / Forum-basert". Under the hood, they're **real radio buttons**, hidden, so the keyboard and screen readers work. Side by side on phones; on top of each other from `sm:`, where the box is only 16rem wide. Same props as `SelectField`.

---

## The pizza results

### `ResultPanel`
The grams per ingredient. **Phones:** a black box. **Desktop:** a list with lines, like the fields. (The `lg:` classes "undo" the black box.)

| Prop | Type | |
|---|---|---|
| `rows` | `ResultRow[]` | `{ label, grams }`, from `calculateDough` (the type is in `pizza/calculateDough.ts`) |
| `pizzaCount`, `ballWeight` | number | for "2 x 372 g" |

If `rows` is empty, it shows "Fyll inn alle feltene".

### `Instructions`
The method, with the time field "Stekes kl." and clock times. Holds **its own** state for the baking time, since nothing else needs it. The steps themselves come from `pizza/method.ts`.

| Prop | Type | |
|---|---|---|
| `pizzaCount`, `ballWeight`, `riseHours`, `riseTemp` | number | |

---

## The recipe building blocks (`src/components/recipe/`)

These use the recipe section's own look (Source Serif 4, Figtree, the panel colour and gold). See [05 – Design](05-design.md).

### `RecipeCard`
One recipe in the overview. The whole card is a link to the recipe.
- `variant="card"` (default): a 4:3 photo, the title in serif, and "time · category".
- `variant="row"`: a small square photo on the left, with the title and info beside it (the list view).

The photo, or the first letter when there's no photo, comes from a small helper in the same file, `CardPhoto`.

| Prop | Type | |
|---|---|---|
| `recipe` | `Recipe` | |
| `variant?` | `"card"` \| `"row"` | default `"card"` |

### `CategoryChips`
Rounded chips: "Alle" first, then one per category from `types.ts`. A shortcut to "Måltid" in the filter panel (the same state): several can be on, and the ticked ones are dark. "Alle" is on when none are ticked, and unticks them all. Controlled.

| Prop | Type | |
|---|---|---|
| `value` | `string[]` | the ticked categories; `[]` = "Alle" |
| `onToggle` | `(category) => void` | tick or untick one |
| `onClear` | `() => void` | "Alle" |

### `SearchField`
The overview's search: a magnifying glass, a ✕ that clears it and puts the cursor back, and 16px text (so iPhones don't zoom). Controlled: the page holds the text.

| Prop | Type |
|---|---|
| `value` | text |
| `onChange` | `(value: string) => void` |

### `FilterPanel`
The "Filter" button (only the icon on phones, with a small number badge) and the panel it opens: a `<dialog>` that's a sheet from the bottom on phones and a full-height panel from the right on desktop, sliding in and out. One `FilterGroupSection` per entry in `filterGroups`, and a bottom bar with "Nullstill" and "Vis 4 oppskrifter". Closes with ✕, Esc, a tap outside, or the bottom button. The classes are in a commented list, `panelClasses`.

| Prop | Type | |
|---|---|---|
| `recipes` | `Recipe[]` | all of them, for the options and counts |
| `filters` | `RecipeFilters` | |
| `onChange` | `(filters) => void` | |
| `activeCount` | number | the number on the button (`activeFilterCount(filters)`) |
| `resultCount` | number | for "Vis 4 oppskrifter" |

### `FilterGroupSection`
One group in the panel: a heading that opens and closes (`<details>`, with the number ticked), a hint ("Alle må passe", "Skjuler oppskrifter med disse"), and the options as 44px chips with a count. Ticked = dark with a ✓; 0 recipes = greyed out. Long groups show the 10 most used (`mostUsedOptions`) and "Vis alle". Måltid, Hovedingrediens and Tid start open, plus any group with something ticked.

Props: `group` (one entry from `filterGroups`), `recipes`, `filters`, `onChange`.

### `ActiveFilters`
The ticked options (except the meals, which the chips show) as small chips with a ✕ above the cards. "Uten" options say so: "Uten løk". Shows nothing when nothing is ticked.

Props: `filters`, `onChange`.

### `RecipeSuggestion` and `PizzaSuggestion`
"Hva med…?": a picture, a small label, the title and the card line, the whole box a link. On phones a bordered box above the search with a square picture; from lg, in the overview's right column, no border and a 4:3 picture like the cards. `RecipeSuggestion` has a "Vis et annet forslag" button; `PizzaSuggestion` (Fridays) says "Pizzatid!" and leads to `/pizza`. Both use `SuggestionBox` in the same file.

| Prop (`RecipeSuggestion`) | Type |
|---|---|
| `recipe` | `Recipe` |
| `onShowAnother` | `() => void` |

### `SortSelect`
"Sorter [Nyeste ▾]" next to the view buttons: the browser's own `<select>` (the phone's own list on phones), with its own arrow. The word "Sorter" is only for screen readers on phones, where the row is tight. Controlled: the page holds the order, in the address.

| Prop | Type |
|---|---|
| `value` | `SortOrder` (`"nyeste"`, `"alfabetisk"`, `"raskest"`) |
| `onChange` | `(value: SortOrder) => void` |

### `ViewToggle`
Icon buttons for the overview's view (grid ▦ / list ☰). The chosen one is dark. Also exports the `RecipeView` type.

| Prop | Type |
|---|---|
| `value` | `RecipeView` (`"standard"` \| `"list"`) |
| `onChange` | `(view) => void` |

### `RecipeImage`
The photo (16:9). Without a photo: a lower placeholder (5:2) in the panel colour, with the first letter of the title.

| Prop | Type |
|---|---|
| `src?` | text (the recipe's `image`) |
| `alt` | text (the title) |

### `RecipeActions`
"Skriv ut" (opens the print dialog) and "Kopier lenke" (copies the address, then says "Lenke kopiert" for 2 seconds), plus «Rediger» for the admin. Holds its own state for "copied". Hidden when printing.

| Prop | Type | |
|---|---|---|
| `onEdit?` | `() => void` | given only to the admin: shows «Rediger» |
| `hasDraft?` | boolean | «Rediger (utkast)»: a draft is waiting in this browser |

### `RecipeMeta`
One line: a clock icon with the time, a plate icon with the portions, four bars with the difficulty (filled up to the level), then `LabelList`. Draws nothing at all (not even its margin) when there's nothing to show.

| Prop | Type |
|---|---|
| `minutes`, `servings` | number |
| `difficulty` | `Difficulty` |
| `labels` | `RecipeLabel[]` (use `recipeLabels(recipe)`) |
| `className?` | text, the space around it (`"mt-6"`) |

### `LabelList`
Small, soft, rounded labels in the panel colour: "Fisk", "Rask". Shows nothing for an empty list. A label with a filter group is a link to the overview filtered on it (`filterLink`, with the label's `option`, or the label itself): «Rask» ticks «Rask (inntil 30 min)» in «Tid». A label without a group would be plain text.

| Prop | Type |
|---|---|
| `labels` | `RecipeLabel[]`: `{ label, group?, option? }`, from `recipeLabels(recipe)` |

### `IngredientsPanel`
**The content of the ingredient panel:** the "INGREDIENSER" heading, `PortionStepper` between two dotted lines, and `IngredientList`. Used in two places: the side panel on desktop, and in the page (before the steps) on phones and paper.

| Prop | Type | |
|---|---|---|
| `ingredients` | `Ingredient[]` | |
| `servings` | number | the chosen number of portions |
| `baseServings` | number | the portions the recipe's amounts are for |
| `onServingsChange` | `(servings: number) => void` | |

### `RecipeSectionNav`
A bar that sticks under the header (`top-[var(--header-height)]`, measured by `Header`) with one button per part («Ingredienser», «Slik gjør du», «Tips»): tap to scroll there, and the part you're reading is dark (`aria-current`). Nothing is shown for fewer than two parts. **Phones only** on the recipe page; «Rediger» uses it on every screen size for the parts of the form. The buttons wrap onto two rows rather than being cut off.

| Prop | Type | |
|---|---|---|
| `sections` | `RecipeSection[]` | from `recipeSections(recipe)` in `display.ts` |
| `label?` | text | what screen readers call the bar |
| `everywhere?` | boolean | on every screen size, not only phones |
| `compact?` | boolean | smaller buttons, so more fit on one row |

### `KeepScreenOn` (and `useWakeLock`)
The «Behold skjermen på» switch above the steps (`role="switch"`, `aria-checked`). `useWakeLock()` works like `useState(false)`, but while it's `true` the browser is asked to keep the screen on (`navigator.wakeLock`), again when the page becomes visible, and lets go on cleanup. Not shown where the browser can't do it. No props.

### `PortionStepper`
"[−] [2] [+] porsjoner": a white number box between two square buttons. Controlled: the page holds the number. The buttons are disabled at `min` and `max`, and screen readers hear the new number (`aria-live`).

| Prop | Type | |
|---|---|---|
| `value` | number | |
| `onChange` | `(value: number) => void` | |
| `min?`, `max?` | number | default 1 and 20 |

### `IngredientList`
The ingredients **in groups** (see `groupIngredients`), one per line: "**300 g** laks, *note*". A group heading like "TIL DIPPEN" above each group.

| Prop | Type | |
|---|---|---|
| `ingredients` | `Ingredient[]` | |
| `scale?` | number | multiplies every amount. Default 1 |

### `StepList`
The steps: a 50×50 gold square with the number in serif, a dotted line, and the text below (16px on phones, 18px on desktop). The square is a button: pressed, it shows ✓ and the step turns grey (cooking mode; kept only while the page is open).

| Prop | Type |
|---|---|
| `steps` | `string[]` |

---

## The admin mode (`src/admin/`)

Only for the admin, and never downloaded by visitors: the editor is loaded with `React.lazy` when «Rediger» is pressed. The fields start with the recipe's values (`defaultValue`) and are read with `FormData` when counting and saving (`readForm.ts`); only the lists hold state.

### `RecipeEditor`
«Rediger»: the whole recipe as a form, in the recipe page's main column. Counts the changes («Lagre 3 endringer»), saves only those (photo first, then `PATCH`), and deletes. Asks before unsaved changes are lost (`useBlocker`, `beforeunload`), keeps a draft (`draft.ts`), offers «Logg inn igjen». Inside, `EditorForm` is the form; `RecipeEditor` around it offers a waiting draft (`DraftNotice`) and starts the form afresh with it (`key`).

| Prop | Type | |
|---|---|---|
| `recipe` | `Recipe` | the saved recipe |
| `onClose` | `() => void` | back to the page (after «Lagre», «Avbryt») |
| `onSaved` | `() => void` | «Lagret ✓» |
| `startAt?` | text | a field to jump to (`?rediger=cuisine`) |

### The parts of the form
| Component | What it is | Props |
|---|---|---|
| `PhotoField` | «Bytt bilde» with a preview, and tap the photo to choose its focus point (a gold dot) | `recipe`, `onChange` |
| `DetailsFields` | Porsjoner, Tid, the four dropdowns and the three groups of checkboxes, from the fixed lists in `types.ts` | `recipe` |
| `IngredientsField` | The ingredient lines (↑ ↓ Fjern, Enter for the next line), name and unit suggestions, «Lim inn liste» | `ingredients`, `onChange` |
| `StepsField` | The steps (↑ ↓ Fjern, «+ Legg til steg»), boxes that grow with the text | `steps`, `onChange` |
| `MissingList` | «Mangler 3 av 9»: tap to jump to the field, ticked off when filled in | `missing`, `filled` |
| `DraftNotice` | «Du har et utkast …» with «Gjenopprett» and «Forkast» | `savedAt`, `onRestore`, `onDiscard` |

`onChange` tells the editor to count the changes again after a list changes (adding a step isn't a key press). The shared look is in `editorStyles.ts`.

---

## Which component uses which

```
App
├── Header ── AdminBar (the admin)
├── HomePage
├── PizzaCalculatorPage
│   ├── FieldGroup
│   │   ├── NumberField ──┐
│   │   ├── SelectField ──┼── FieldCard
│   │   └── ChoiceTags    │  (same layout, own code)
│   ├── ResultPanel
│   └── Instructions
├── RecipeListPage (holds view, day and suggestion; the filters are in the address)
│   ├── RecipeSuggestion / PizzaSuggestion ── SuggestionBox
│   ├── SearchField
│   ├── FilterPanel ── FilterGroupSection (× each filter group)
│   ├── CategoryChips, ActiveFilters, SortSelect, ViewToggle
│   └── RecipeCard (× each recipe) ── CardPhoto
├── DataCheckPage
├── NewRecipePage, LoginPage (lazy)
├── RecipePage (holds «Lagret ✓»: Notice)
│   ├── RecipeView (in the same file; holds the portions)
│   │   ├── RecipeImage, RecipeActions, RecipeMeta ── LabelList
│   │   ├── RecipeEditor (the admin, ?rediger; React.lazy)
│   │   │   ├── DraftNotice, RecipeSectionNav (everywhere), MissingList
│   │   │   └── PhotoField, DetailsFields, IngredientsField, StepsField
│   │   ├── RecipeSectionNav (phones)
│   │   ├── KeepScreenOn, StepList (tick off steps)
│   │   └── IngredientsPanel (side panel on desktop; in the page on phones and paper)
│   │       └── PortionStepper, IngredientList
│   └── NotFoundPage (unknown recipe)
├── NotFoundPage
│   └── Container
└── Footer
```

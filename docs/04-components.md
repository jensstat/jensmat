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
| `RecipeListPage` | `/oppskrifter` | The overview: "Hva med…?", search, the filter panel, meal chips, the chosen filters, grid/list toggle, recipe cards. Holds `view`, `filters`, `day` and `suggestion` in state. See [03](03-recipes.md), section 6 |
| `RecipePage` | `/oppskrifter/:id` | One recipe. See [03](03-recipes.md) |
| `DataCheckPage` | `/oppskrifter/datasjekk` | The Datasjekk: every recipe and what it's missing. Not in the menu. Rules in `recipes/completeness.ts` |
| `NotFoundPage` | everything else | "Fant ikke siden". Props: `title?`, `message?`. Also used by `RecipePage` for unknown recipes |

---

## Shared on every page

### `Header`
The logo and the menu. **No props.**
- Uses `NavLink`, which knows whether it points to the current page, and then gets a black underline and `aria-current` (for screen readers).
- `end` on "Hjem" stops it from being active on every page (every address starts with `/`).
- On phones, the logo and menu are stacked; from `md:`, they're side by side.

### `Footer`
"© year Min matnettside". **No props.** The year is worked out once, outside the component.

### `Container`
The shared page width: centred, `max-w-6xl`, with the same side padding as the header, so content lines up with the logo.

| Prop | Type | |
|---|---|---|
| `children` | anything | the content |

Used by: `NotFoundPage`. (The other pages still write the same classes themselves, and `RecipePage` is deliberately wider: up to 1500px.)

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
| `options` | `SelectOption[]` | `{ value, label }`. `value` is what the code sees, `label` what the user sees |
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
| `rows` | `ResultRow[]` | `{ label, grams }`, from `calculateDough` |
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
"Hva med…?" above the search: a square picture, a small label, the title and the card line, the whole box a link. `RecipeSuggestion` has a "Vis et annet forslag" button; `PizzaSuggestion` (Fridays) says "Pizzatid!" and leads to `/pizza`. Both use `SuggestionBox` in the same file.

| Prop (`RecipeSuggestion`) | Type |
|---|---|
| `recipe` | `Recipe` |
| `onShowAnother` | `() => void` |

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
"Skriv ut" (opens the print dialog) and "Kopier lenke" (copies the address, then says "Lenke kopiert" for 2 seconds). **No props.** Holds its own state for "copied". Hidden when printing.

### `RecipeMeta`
One line: a clock icon with the time, a plate icon with the portions, then `LabelList`.

| Prop | Type |
|---|---|
| `minutes`, `servings` | number |
| `labels` | `string[]` (use `recipeLabels(recipe)`) |

### `LabelList`
Small, soft, rounded labels in the panel colour: "Fisk", "Rask". Shows nothing for an empty list. Will be reused on the recipe cards.

| Prop | Type |
|---|---|
| `labels` | `string[]` |

### `IngredientsPanel`
**The content of the ingredient panel:** the "INGREDIENSER" heading, `PortionStepper` between two dotted lines, and `IngredientList`. Used in two places: the side panel on desktop, and the full-screen panel on phones.

| Prop | Type | |
|---|---|---|
| `ingredients` | `Ingredient[]` | |
| `servings` | number | the chosen number of portions |
| `baseServings` | number | the portions the recipe's amounts are for |
| `onServingsChange` | `(servings: number) => void` | |
| `headingId?` | text | lets the phone dialog use the heading as its name |

### `MobileIngredients`
**Phones only** (`lg:hidden`). An "INGREDIENSER" bar that sticks to the bottom of the screen (with the number of ingredients and portions), and a full-screen `<dialog>` with `IngredientsPanel` and a round close button. The browser's `<dialog>` closes on Esc and keeps Tab inside itself. The page behind can't scroll while it's open (a rule in `index.css`).

Same props as `IngredientsPanel`, apart from `headingId`.

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
The steps: a 50×50 gold square with the number in serif, a dotted line, and the text below (16px on phones, 18px on desktop).

| Prop | Type |
|---|---|
| `steps` | `string[]` |

---

## Which component uses which

```
App
├── Header
├── HomePage
├── PizzaCalculatorPage
│   ├── FieldGroup
│   │   ├── NumberField ──┐
│   │   ├── SelectField ──┼── FieldCard
│   │   └── ChoiceTags    │  (same layout, own code)
│   ├── ResultPanel
│   └── Instructions
├── RecipeListPage (holds view, filters, day and suggestion)
│   ├── RecipeSuggestion / PizzaSuggestion ── SuggestionBox
│   ├── SearchField
│   ├── FilterPanel ── FilterGroupSection (× each filter group)
│   ├── CategoryChips, ActiveFilters, ViewToggle
│   └── RecipeCard (× each recipe) ── CardPhoto
├── DataCheckPage
├── RecipePage
│   ├── RecipeView (in the same file; holds the portions)
│   │   ├── RecipeImage, RecipeActions, RecipeMeta ── LabelList
│   │   ├── StepList
│   │   ├── IngredientsPanel (desktop) ──┐
│   │   └── MobileIngredients (phones) ──┴── IngredientsPanel ── PortionStepper, IngredientList
│   └── NotFoundPage (unknown recipe)
├── NotFoundPage
│   └── Container
└── Footer
```

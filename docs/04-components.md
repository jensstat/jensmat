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
| `RecipePage` | `/oppskrifter/:id` | One recipe. See [03](03-recipes.md) |
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

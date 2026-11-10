# 03 – The recipes

The recipes ("Oppskrifter") are the main part of the site going forward: all my meals, one page per recipe. Later they'll be posted from a phone app with a photo. For now, they're stored in a file in the code.

---

## 1. The files

| File | Layer | What it does |
|---|---|---|
| `recipes/types.ts` | knowledge | **What a recipe is**: the fields, and the fixed lists of categories, main ingredients and tags |
| `recipes/data.ts` | knowledge | **The recipes themselves**, as a list |
| `recipes/recipes.ts` | knowledge | **The data layer**: `getAllRecipes()` and `getRecipe(id)`. The pages get recipes through these |
| `recipes/display.ts` | knowledge | **How things are shown as text**: amounts (½), time (1 t 15 min), labels |
| `recipes/display.test.ts` | test | Checks `display.ts` |
| `recipes/filter.ts` (+ test) | knowledge | **Which recipes to show** in the overview: `filterRecipes(recipes, filters)` |
| `recipes/data.test.ts` | test | Checks every recipe in `data.ts` (ids, dates, numbers) |
| `pages/RecipeListPage.tsx` | page | **The overview** of all recipes, at `/oppskrifter` (section 6) |
| `pages/RecipePage.tsx` | page | **One** recipe, at `/oppskrifter/:id` (section 5) |
| `components/recipe/…` | components | The building blocks of both pages |

---

## 2. What a recipe is (`types.ts`)

```ts
interface Recipe {
  id: string;              // in the address: /oppskrifter/laksewrap. Lowercase, never change it.
  title: string;           // the ONLY content that must be filled in
  description?: string;
  image?: string;          // A file path now, a web address from the CMS later.
  category?: Category;     // "Frokost" | "Lunsj" | "Middag" | "Dessert" | "Bakst" | "Tilbehør"
  protein?: Protein;       // "Kylling" | "Kjøtt" | "Fisk" | "Sjømat" | "Vegetar" | "Vegansk"
  tags: Tag[];             // "Glutenfri" | "Laktosefri" | "Barnevennlig". [] if none.
  occasions?: Occasion[];  // "Ukedag" | "Helgemat", only on dinners. Missing = ["Ukedag"]
  servings?: number;       // how many portions the amounts are for
  minutes?: number;        // total time
  ingredients: Ingredient[]; // [] = not added yet
  steps: string[];         // [] = no steps (not every recipe needs them)
  createdAt: string;       // "2026-11-09" (year-month-day)
  source?: string;         // "Mormor", a cookbook, a web address
  tips?: string;
}

interface Ingredient {
  amount?: number;         // optional: "salt og pepper" has none
  unit?: string;           // optional: "3 egg" has none
  name: string;            // kept clean: "løk", not "løk, finhakket"
  note?: string;           // "finhakket" … shown after the name in gray
  group?: string;          // "Til dippen" … shown together under that heading
}
```

### Incomplete recipes: only the title is required

A recipe can be posted half-done, for example quickly from the phone with just a title and a photo, and filled in later. So:

- **Required:** `title`, plus `id` and `createdAt`, which are technical (a CMS makes them).
- **Lists are always there, but may be empty:** `tags`, `ingredients` and `steps` are `[]` when there's nothing yet. Then the code can always write `recipe.steps.map(...)` without checking first. When the CMS arrives, the translation in `recipes.ts` turns a missing list into `[]`, in one place.
- **Everything else is optional,** and every part of the site only shows what's there: no "undefined min" on the cards, no portion selector without `servings`, no "Slik gjør du" without steps, no ingredient panel without ingredients.
- **"Uferdig" (incomplete)** is worked out, not stored: `isIncomplete(recipe)` in `types.ts` is "no ingredients yet". The card gets an "Uferdig" label, and the recipe page says "Denne oppskriften er ikke ferdig ennå". To change what counts as incomplete, change that one function.
- **The example:** "Fiskesuppe" in `data.ts` has only a title.

### Why it's built like this

| Decision | Why |
|---|---|
| **`amount` is a number**, not text like "3 dl" | So portions can be scaled: 2 → 4 portions is just "× 2" |
| **`protein` is its own field**, not a tag | A dish has *one* main ingredient. As a field it can't be forgotten (TypeScript checks), and it makes nice filter buttons |
| **"Rask" (quick) isn't stored** | It's worked out: `isQuick(recipe)` is `minutes <= 30`. Then it can never be wrong if you change the time. No time means not quick |
| **"Uferdig" isn't stored either** | `isIncomplete(recipe)`, for the same reason: it can't still say "Uferdig" after you've added the ingredients |
| **`createdAt` as `"2026-11-09"`** | The standard date format every database and CMS uses. It also sorts correctly as plain text |
| **`occasions` is its own field**, not a tag | It's only for picking the "Hva med…?" suggestion, and tags are shown as labels on the recipe. Every dinner is weekday food unless it says otherwise: `occasionsOf(recipe)` in `types.ts` gives `["Ukedag"]` when it's missing. So only weekend food needs marking: `["Helgemat"]`, or `["Ukedag", "Helgemat"]` for both |
| **`note` on the ingredient** | Keeps `name` clean for search and a future shopping list |
| **`group` on the ingredient** | Parts of a dish ("Til dippen", "Saus") get their own heading, without a separate list structure. Ingredients without a group come first |

### The fixed lists

Categories, main ingredients and tags are written **once**, as arrays, and the types are made from them:

```ts
export const categories = ["Frokost", "Lunsj", "Middag", …] as const;
export type Category = (typeof categories)[number];
```

This gives you **both** a type (TypeScript complains if a recipe says "Midag") **and** a list you can `.map()` over, for example to make filter buttons. A plain union type (`"Frokost" | "Lunsj"`) only exists for TypeScript and can't be looped over.

---

## 3. The data layer (`recipes.ts`)

The pages **never** read `data.ts` directly. They ask:

```ts
getAllRecipes()       // all the recipes, newest first
getRecipe("laksewrap") // one recipe, or undefined if there's none with that id
```

**Why:** when the recipes move to a CMS or database, only this file changes. The pages stay the same:

```
Now:    RecipePage ──▶ getRecipe(id) ──▶ data.ts (a list in the code)
Later:  RecipePage ──▶ getRecipe(id) ──▶ the CMS / database over the internet
```

(One thing *will* change then: fetching over the internet takes time, so the functions will become `async`, and the pages will need a "loading…" state. That's a normal next step, and the data layer is where it starts.)

---

## 4. Showing recipes as text (`display.ts`)

Pure functions that turn data into readable text. The recipe page uses them now, and the recipe cards will too.

| Function | Example |
|---|---|
| `formatAmount(n)` | `0.5` → "½", `1.5` → "1 ½", `300` → "300", `1.2` → "1,2". Rounds "odd" numbers from scaling: `0.4999` → "½" |
| `formatQuantity(amount, unit)` | `(0.5, "pose")` → "½ pose", `(4)` → "4", no amount → "" |
| `formatMinutes(n)` | `30` → "30 min", `60` → "1 t", `75` → "1 t 15 min" |
| `recipeLabels(recipe)` | main ingredient + "Rask" if quick + the tags, e.g. `["Fisk", "Rask"]` |
| `groupIngredients(list)` | the ingredients in groups for showing: ungrouped first, then "Til dippen" … |

---

## 5. The recipe page

The recipe section is **modelled on Gladkokken**: the same font sizes, a wide layout, an ingredient panel on the right, gold step squares, and an ingredient menu on phones. Details in [05 – Design](05-design.md).

```
Desktop (from lg:)                                        Phones
┌────────────────────────────────────┬────────────────┐   ┌──────────────────┐
│ ← Alle oppskrifter                 │ INGREDIENSER   │   │ photo            │
│ RecipeImage (photo / placeholder)  │ ·············· │   │ Skriv ut · Kopier│
│ Skriv ut · Kopier lenke            │ [−][2][+] pors.│   │ Laksewrap        │
│ Laksewrap              (44px)      │ ·············· │   │ intro, meta      │
│ intro                  (22px)      │ 300 g laks     │   │ Slik gjør du     │
│ 30 min · 2 porsjoner · Fisk · Rask │ …   (sticky)   │   │ ▣ 1 ·········    │
│ Slik gjør du                       │                │   │ …                │
│ ▣ 1 ···························    │                │   ├──────────────────┤
│ text (18px)                        │                │   │ INGREDIENSER  ▲  │ ← sticks to the
└────────────────────────────────────┴────────────────┘   └──────────────────┘   bottom; opens a
   up to 1500px; the panel colour continues to the screen edge                   full-screen panel
```

**Two components in one file:**
- `RecipePage` finds the recipe from the address (`useParams()` → `getRecipe(id)`). Unknown recipe → `NotFoundPage`.
- `RecipeView` draws it, and holds the **number of portions** in state.
- `RecipePage` gives `RecipeView` a `key={recipe.id}`. When you move to another recipe, React starts `RecipeView` afresh, so the portions start at the new recipe's own number.

**The panel to the screen edge:** the main column and the panel sit in a container of at most 1500px. To make the panel colour continue to the right edge on wide screens, the `<article>` gets a background that's white on the left half and panel-coloured on the right half (`linear-gradient(to right, white 50%, panel 50%)`). The main column is white on top of it, so the panel colour only shows to the right of the main column.

**The ingredients appear twice in the code, but only once on screen:**
- **Desktop:** `IngredientsPanel` in a side panel (`hidden lg:block`), with sticky content that scrolls on its own if the list is taller than the screen.
- **Phones:** `MobileIngredients`, an "INGREDIENSER" bar (`sticky bottom-0`) that opens the same `IngredientsPanel` in a full-screen `<dialog>`. Both get the **same** `servings`, so changing portions in one shows in the other.

**Portions:** `PortionStepper` changes `servings`. `IngredientsPanel` computes `scale = servings / baseServings` and passes it to `IngredientList`, which multiplies every amount: 2 → 4 portions turns 300 g into 600 g, and ½ løk into 1.

**Actions:** "Skriv ut" opens the browser's print dialog. "Kopier lenke" copies the address and shows "Lenke kopiert" for 2 seconds.

## 6. The overview page (`/oppskrifter`)

```
Oppskrifter
Finn noe godt å lage!
[🔍 Søk etter oppskrift eller ingrediens       ✕]                 ← search field
(Alle) (Frokost) (Lunsj) (Middag) (Dessert) (Bakst) (Tilbehør)   ← CategoryChips
4 oppskrifter                                        [▦] [☰]      ← count + ViewToggle
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ photo│ │ photo│ │ photo│ │ photo│                              ← RecipeCard (variant "card")
│Title │ │Title │ │Title │ │Title │
│10 min│ │30 min│ │1 t 30│ │20 min│
└──────┘ └──────┘ └──────┘ └──────┘
```

**How it works:**
- **The state** lives in `RecipeListPage`: `view` (`"standard"` or `"list"`) and `filters`, with `category` (`null` means "Alle") and `query` (the search text, `""` means no search).
- **Search** looks in the title, the description and the ingredient names. It ignores upper/lower case and spaces at the ends, but the field still shows exactly what was typed: the cleaning happens in `filterRecipes`, not in the state. Search and category must both match. A recipe without a category only shows under "Alle".
- **The search field** has a magnifying glass, a ✕ that clears it and puts the cursor back, and 16px text, so iPhones don't zoom in when you tap it. The browser's own ✕ is hidden, since we have our own.
- **The recipes to show** are calculated on every render, never stored: `visibleRecipes = filterRecipes(recipes, filters)`. The count, the cards and the empty state all read from it.
- **`filterRecipes`** (in `recipes/filter.ts`) is a pure function with tests, like `calculateDough`. **To add a filter** (search, main ingredient, "Rask"): one more field in `RecipeFilters`, one more rule in `filterRecipes`, and a control on the page.
- **The views:** a `layouts` lookup in the page picks the grid's classes for each view. "Standard" is 2 cards per row on phones and up to 4 on desktop. "List" is compact rows (`RecipeCard` with `variant="row"`), in two columns on desktop. **To add a view:** one line in `ViewToggle`'s `options`, one line in `layouts`. TypeScript reminds you if you forget one.
- **"Hva med…?"** (under the subtitle): one suggested recipe, with a "Vis et annet forslag" button. The rules are in `recipes/suggest.ts`, as pure functions with tests. `pickSuggestion(recipes, day, current)` picks a complete dinner that suits the day (Monday–Friday "Ukedag", Saturday "Helgemat", Sunday either: see `occasions` in section 2), never the same one twice in a row. If nothing suits, it falls back to any dinner, then any complete recipe, and only shows nothing if there are no complete recipes. On **Fridays** (`isPizzaDay`) the page shows "pizzatid" with a link to the pizza calculator instead. The page reads the weekday **once**, into state (`day`), and passes it in, so the functions never read the clock and the tests can pretend it's any day.
- **When nothing matches:** "Fant ingen oppskrifter", with the search text in the message ("Ingen oppskrifter passer med «laks» i Dessert."), and a "Vis alle oppskrifter" button that resets every filter, the search too.

## 7. The plan going forward

| Step | Status |
|---|---|
| Data model, example data, data layer | ✅ done |
| The recipe page, with its own look | ✅ done |
| Ingredient groups | ✅ done (`group`) |
| Change the number of portions | ✅ done (`PortionStepper`) |
| An "Ingredienser" menu on phones (like Gladkokken) | ✅ done (`MobileIngredients`) |
| The overview page `/oppskrifter`, with cards, grid/list view and category filter | ✅ done |
| Search (title, description, ingredients) | ✅ done |
| Incomplete recipes (only a title required, "Uferdig" label) | ✅ done |
| More filters (main ingredient, "Rask", tags) | `filterRecipes` and the lists in `types.ts` are ready |
| Photos | add `image` to a recipe, with the file in `public/images/recipes/`. Without one, a calm placeholder is shown |
| CMS / phone app | see below |

### Later: CMS and a phone app

To post recipes with a photo from the phone, the recipes have to live somewhere other than the code. Two common routes:

| Route | Examples | Good for |
|---|---|---|
| **Headless CMS** | Sanity, Contentful, Strapi | A ready-made admin tool with forms and image upload, which also works on a phone. Quick to get going |
| **Database + image store** | Supabase, Firebase | Building your own app and forms. More work, more learning |

Either way, the **shape** in `types.ts` moves over to the CMS or database, and `recipes.ts` starts fetching from there. That's why those two files were made first.

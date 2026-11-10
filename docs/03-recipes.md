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
| `pages/RecipePage.tsx` | page | One recipe, at `/oppskrifter/:id` |
| `components/recipe/…` | components | The building blocks of the recipe page (see section 5) |

---

## 2. What a recipe is (`types.ts`)

```ts
interface Recipe {
  id: string;              // in the address: /oppskrifter/laksewrap. Lowercase, never change it.
  title: string;
  description: string;
  image?: string;          // optional. A file path now, a web address from the CMS later.
  category: Category;      // "Frokost" | "Lunsj" | "Middag" | "Dessert" | "Bakst" | "Tilbehør"
  protein?: Protein;       // optional. "Kylling" | "Kjøtt" | "Fisk" | "Sjømat" | "Vegetar" | "Vegansk"
  tags: Tag[];             // "Glutenfri" | "Laktosefri" | "Barnevennlig". [] if none.
  servings: number;        // how many portions the amounts are for
  minutes: number;         // total time
  ingredients: Ingredient[];
  steps: string[];
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

### Why it's built like this

| Decision | Why |
|---|---|
| **`amount` is a number**, not text like "3 dl" | So portions can be scaled: 2 → 4 portions is just "× 2" |
| **`protein` is its own field**, not a tag | A dish has *one* main ingredient. As a field it can't be forgotten (TypeScript checks), and it makes nice filter buttons |
| **"Rask" (quick) isn't stored** | It's worked out: `isQuick(recipe)` is `minutes <= 30`. Then it can never be wrong if you change the time |
| **`createdAt` as `"2026-11-09"`** | The standard date format every database and CMS uses. It also sorts correctly as plain text |
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

## 6. The plan going forward

| Step | Status |
|---|---|
| Data model, example data, data layer | ✅ done |
| The recipe page, with its own look | ✅ done |
| Ingredient groups | ✅ done (`group`) |
| **The overview page** `/oppskrifter`, with recipe cards | ⏭ next. Today, the menu link leads to "Fant ikke siden" |
| Change the number of portions | ✅ done (`PortionStepper`) |
| Search and filter (category, main ingredient, tags, "Rask") | the lists in `types.ts` are ready |
| Photos | add `image` to a recipe, with the file in `public/images/recipes/`. Without one, a calm placeholder is shown |
| An "Ingredienser" menu on phones (like Gladkokken) | ✅ done (`MobileIngredients`) |
| CMS / phone app | see below |

### Later: CMS and a phone app

To post recipes with a photo from the phone, the recipes have to live somewhere other than the code. Two common routes:

| Route | Examples | Good for |
|---|---|---|
| **Headless CMS** | Sanity, Contentful, Strapi | A ready-made admin tool with forms and image upload, which also works on a phone. Quick to get going |
| **Database + image store** | Supabase, Firebase | Building your own app and forms. More work, more learning |

Either way, the **shape** in `types.ts` moves over to the CMS or database, and `recipes.ts` starts fetching from there. That's why those two files were made first.

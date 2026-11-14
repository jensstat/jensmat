# 03 – The recipes

The recipes ("Oppskrifter") are the main part of the site going forward: all my meals, one page per recipe. Later they'll be posted from a phone app with a photo. For now, they're stored in a file in the code.

---

## 1. The files

| File | Layer | What it does |
|---|---|---|
| `recipes/types.ts` | knowledge | **What a recipe is**: the fields, the fixed lists (categories, main ingredients, tags, themes, cuisines, difficulties), and what's worked out (`isQuick`, `isIncomplete`, `timeRangeOf`, `occasionsOf`) |
| `recipes/data.ts` | knowledge | **The recipes themselves**, as a list |
| `recipes/toRecipe.ts` (+ test) | knowledge | **The border**: `toRecipe(raw)` checks a recipe from outside and gives a real `Recipe` (section 3) |
| `recipes/recipes.ts` (+ test) | knowledge | **The data layer**: `getAllRecipes()` and `getRecipe(id)`, which return a `Promise`. The loaders (`src/loaders.ts`) call these, and the pages get the answer with `useLoaderData()` |
| `recipes/display.ts` | knowledge | **How things are shown as text**: amounts (½), time (1 t 15 min), labels |
| `recipes/display.test.ts` | test | Checks `display.ts` |
| `recipes/filter.ts` (+ test) | knowledge | **Which recipes to show** in the overview: `filterRecipes(recipes, filters)`, the filter groups (`filterGroups`), and the counts and helpers the panel uses |
| `recipes/suggest.ts` (+ test) | knowledge | **"Hva med…?"**: `pickSuggestion(recipes, day, current)` and `isPizzaDay` |
| `recipes/sort.ts` (+ test) | knowledge | **The order on the overview**: `sortRecipes(recipes, order)` (Nyeste, A–Å, Raskest) and `sortFromParams` |
| `recipes/completeness.ts` (+ test) | knowledge | **The Datasjekk**: what each recipe is missing (`missingInfo`, `completenessReport`) |
| `recipes/parseIngredients.ts` (+ test) | knowledge | **A pasted ingredient list → ingredient lines** (`parseIngredientList`), used by «Lim inn liste» in the Studio |
| `recipes/testRecipe.ts` | test | `makeRecipe({ … })`: a made-up recipe for the tests |
| `recipes/data.test.ts` | test | Checks every recipe in `data.ts` (ids, dates, numbers) |
| `pages/RecipeListPage.tsx` | page | **The overview** of all recipes, at `/oppskrifter` (section 6) |
| `pages/RecipePage.tsx` | page | **One** recipe, at `/oppskrifter/:id` (section 5) |
| `pages/DataCheckPage.tsx` | page | **The Datasjekk**, at `/oppskrifter/datasjekk` (not in the menu) |
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
  cuisine?: Cuisine;       // "Norsk" | "Italiensk" | "Indisk" | … | "Fusion" (the list in types.ts)
  difficulty?: Difficulty; // "Superenkel" | "Enkel" | "Middels" | "Avansert"
  tags: Tag[];             // "Glutenfri" | "Laktosefri". [] if none.
  themes?: Theme[];        // "Sunn" | "Kos" | "Gjester" | "Barnevennlig" | "Tradisjon" | "Høytid" | "Matpakke og tur".
                           // Missing = not filled in yet; [] = none fit
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

A recipe can be posted half-done, for example quickly from the phone with just a title and a photo, and filled in later. That's what **«Ny oppskrift»** (`/ny-oppskrift`, in the admin bar) is for: the quick way to post, on purpose only a title and maybe a photo. The rest is filled in with **«Rediger»** on the recipe, whenever you have time (see [07](07-how-to.md)). So:

- **Required:** `title`, plus `id` and `createdAt`, which are technical (a CMS makes them).
- **Lists are always there, but may be empty:** `tags`, `ingredients` and `steps` are `[]` when there's nothing yet. Then the code can always write `recipe.steps.map(...)` without checking first. Every recipe goes through one translation, `toRecipe` (section 3), which turns a missing list into `[]`, in one place.
- **Everything else is optional,** and every part of the site only shows what's there: no "undefined min" on the cards, no portion selector without `servings`, no "Slik gjør du" without steps, no ingredient panel without ingredients.
- **"Uferdig" (incomplete)** is worked out, not stored: `isIncomplete(recipe)` in `types.ts` is "no ingredients yet". The card gets an "Uferdig" label, and the recipe page says "Denne oppskriften er ikke ferdig ennå". To change what counts as incomplete, change that one function.
- **Visitors don't see "Uferdig" recipes** on the overview (`shownRecipes` in `filter.ts`): only recipes they can cook. You see them all when you're logged in. A direct link to one still works.
- **The example:** "Fiskesuppe" in `data.ts` has only a title.
- **Missing information and the filter:** a recipe without e.g. a cuisine is shown as normal, but hidden while you filter on cuisine (we can't know if it fits). Each filter group says what information it needs (`hasInfo` in `filter.ts`).
- **The Datasjekk** at `/oppskrifter/datasjekk` (in the admin bar, not in the menu) lists every recipe and what it's missing, the most first. The rules are in `recipes/completeness.ts`; each check also names its field (`field: "cuisine"`). The Studio shows the same list, and so does «Rediger» («Mangler 3 av 9»). Logged in, each missing thing on the Datasjekk opens «Rediger» at that field.

### Why it's built like this

| Decision | Why |
|---|---|
| **`amount` is a number**, not text like "3 dl" | So portions can be scaled: 2 → 4 portions is just "× 2" |
| **`protein` is its own field**, not a tag | A dish has *one* main ingredient. As a field it can't be forgotten (TypeScript checks), and it makes nice filter buttons |
| **"Rask" (quick) isn't stored** | It's worked out: `isQuick(recipe)` is `minutes <= 30`. Then it can never be wrong if you change the time. No time means not quick |
| **Time ranges aren't stored** | The filter's "Rask (inntil 30 min)", "Under 20 min", "20–40 min", "40–60 min", "Over 60 min" come from `minutes` (`isQuick` and `timeRangeOf` in `types.ts`). Nothing extra to fill in |
| **`themes` is its own field, not tags** | Tags are diet needs (Glutenfri, Laktosefri): `[]` means "none apply", so they're never "missing". Themes are the mood or occasion, and *missing* means "not filled in yet" (the Datasjekk asks for it), while `[]` means "you've decided none fit". Both are shown as labels on the recipe |
| **"Uferdig" isn't stored either** | `isIncomplete(recipe)`, for the same reason: it can't still say "Uferdig" after you've added the ingredients |
| **`createdAt` as `"2026-11-09"`** | The standard date format every database and CMS uses. It also sorts correctly as plain text |
| **`occasions` is its own field**, not a tag | It's only for picking the "Hva med…?" suggestion, and tags are shown as labels on the recipe. Every dinner is weekday food unless it says otherwise: `occasionsOf(recipe)` in `types.ts` gives `["Ukedag"]` when it's missing. So only weekend food needs marking: `["Helgemat"]`, or `["Ukedag", "Helgemat"]` for both |
| **`note` on the ingredient** | Keeps `name` clean for search and a future shopping list |
| **`group` on the ingredient** | Parts of a dish ("Til dippen", "Saus") get their own heading, without a separate list structure. Ingredients without a group come first |
| **Amounts by feel: no amount** (decided 12 November) | Some ingredients aren't measured ("as much salad as fits the bowl"). Leave the amount empty, and say it in the **group** ("Grønnsaker (etter ønske)", shown once as a heading) or the **note** ("etter ønske"). The portion buttons leave a line without an amount as it is, the filters only use the name, and the Datasjekk doesn't ask for amounts. Never put the vagueness in the name ("litt paprika"): the filter, the name suggestions and "Like ingrediensnavn" all need the clean name. A "ca." checkbox was considered and not needed |

### The fixed lists

Categories, main ingredients, tags, themes, cuisines and difficulties are written **once**, as arrays, and the types are made from them:

```ts
export const categories = ["Frokost", "Lunsj", "Middag", …] as const;
export type Category = (typeof categories)[number];
```

This gives you **both** a type (TypeScript complains if a recipe says "Midag") **and** a list you can `.map()` over, for example to make filter buttons. A plain union type (`"Frokost" | "Lunsj"`) only exists for TypeScript and can't be looped over. **To add a value** (a cuisine, a theme …), add it to its list; the filter panel shows it by itself.

---

### Writing ingredients so the filter works

The ingredient options in the filter ("Har ingredienser", "Uten ingredienser") are made from the recipes themselves (`ingredientNames` in `filter.ts`): every unique `name`, cleaned (lower case, no spaces at the ends) and sorted the Norwegian way. **A new ingredient shows up in the filter by itself.** That only works well if the names are written the same way everywhere:

| Rule | Write | Not |
|---|---|---|
| **Only the ingredient in `name`.** How it's cut, or alternatives, go in `note` | `{ name: "løk", note: "finhakket" }` | `{ name: "løk, finhakket" }` |
| **One ingredient per line.** Split lists | `salt`, `pepper`, `muskat` (three lines) | `"salt, pepper og muskat"` |
| **Alternatives in the note** | `{ name: "kesam", note: "eller crème fraiche" }` | `"kesam eller crème fraiche"` |
| **The same name in every recipe.** Pick one form and stick to it | `tomat` everywhere | `tomat` here, `tomater` there |
| **Lower case** (except names of brands, which the filter shows in lower case anyway) | `løk` | `Løk` |

**When are two things different ingredients?** When you'd buy them separately, or when someone might want one but not the other. `rødløk` and `løk` are two ingredients, and so are `hvitløk` and `løk`: "Uten løk" does **not** hide a recipe with only rødløk or hvitløk, because the filter compares whole names. Likewise `tomat` (fresh) and `hakkede tomater` (a can) are two products. If someone should be able to avoid both, tick both.

**Pasting a whole list** (in the Studio, «Lim inn liste» under the ingredients): one ingredient per line. `2 dl melk` → amount, unit, name; `3 egg` → no unit (only known units like g, dl, ss, ts, stk, fedd, boks count); `Løk, finhakket` → name `løk`, note `finhakket` (the **first comma** splits name and note; a decimal comma in `1,5 dl` doesn't). `(400 g)` in the name moves to the note, names are lower-cased, and bullets are removed. A line ending in `:` (`Til sausen:`) is the group for the lines after it. **When a line can't be read for sure, the whole line becomes the name and no number is invented** (`2-3 fedd hvitløk`, `en klype salt`), so check the new lines and fix those by hand. The lines are added at the end of the list; nothing is replaced.

**To check:** the **Datasjekk** (on the site, and as «Datasjekk» in the Studio's left column, with the same rules) lists "Like ingrediensnavn": names that are probably the same thing, with the recipes that use each (`similarIngredientNames` in `completeness.ts`). Two names count as similar when they're the same without a Norwegian ending (`tomat`/`tomater`/`tomatene`, `paprika`/`paprikaer`, `pære`/`pærer`), or, for names of 5 letters or more, one letter apart (`kremfløte`/`kremfløde`). `løk` and `rødløk` aren't similar: they're two ingredients.

## 3. The data layer (`recipes.ts`)

The pages **never** read `data.ts` directly. Their loaders (`src/loaders.ts`) ask:

```ts
await getAllRecipes()        // all the recipes, newest first
await getRecipe("laksewrap") // one recipe, or undefined if there's none with that id
await getSkippedRecipes()    // the ones that couldn't be read (for the Datasjekk)
```

They return a **`Promise`** ("the answer comes later"), like a fetch over the internet does, even though `data.ts` is right there. So the pages already handle waiting and failing, and nothing changes when the CMS comes:

```
Now:    loader ──▶ getRecipe(id) ──▶ fetchRecipes() ──▶ data.ts        ──▶ toRecipe ──▶ the page
Later:  loader ──▶ getRecipe(id) ──▶ fetchRecipes() ──▶ fetch(the CMS) ──▶ toRecipe ──▶ the page
```

Only `fetchRecipes` in `recipes.ts` changes (the comment there shows how).

**Waiting and failing:**
- **React Router runs the loader before showing the page.** The page reads the answer with `useLoaderData()`, so it never has a "not loaded yet" state of its own.
- **"Laster…"**: while the next page loads, the old one stays on screen and a small "Laster…" fades in at the top (only if it takes more than a moment). On the very first load, `LoadingPage` is shown.
- **"Kunne ikke hente oppskriftene"**: if a loader fails, `RouteErrorPage` is shown, with a "Prøv igjen" button that runs the loaders again. The header and footer stay.
- **Pretending, while developing** (`npm run dev` only): `pretendDelayMs` in `recipes.ts` waits 300 ms, so you see "Laster…". Set `pretendToFail` to `true` to see the error page (and back to `false` afterwards).

### The border (`toRecipe.ts`)

Every recipe goes through **`toRecipe(raw)`** on the way in, the recipes in `data.ts` too, so they take the same path as CMS recipes will. TypeScript only checks the code before it runs; data that arrives while the site runs has to be checked by the code itself. `toRecipe` takes `unknown` (anything) and gives a real `Recipe`, or `undefined`.

| What arrives | What happens |
|---|---|
| No id or title (or only spaces) | The recipe is **skipped**: named in the browser console and in a red box on the Datasjekk. The page never crashes |
| Two recipes with the same id | The second is skipped the same way (two recipes can't have the same address) |
| A missing list (`ingredients`, `steps`, `tags`) | Becomes `[]` |
| A value that isn't in its fixed list (`category: "Midag"`) | Left out, as if not filled in. The Datasjekk then asks for it |
| A number that isn't a number above 0 (`minutes: "30"`, `-5`) | Left out |
| An ingredient without a name, an empty step | Left out of the list |
| Text | Trimmed; empty text counts as missing |
| A date that isn't year-month-day | `createdAt: ""`, so the recipe sorts last |

`readRecipes(list)` runs a whole list through and returns `{ recipes, skipped }`. `data.test.ts` checks that every recipe in `data.ts` goes through **unchanged**: if it fails, a value there is something the border leaves out, or a new field was added to `Recipe` but not to `toRecipe`. **When you add a field to `Recipe`, add a line to `toRecipe` too.**

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

The recipe section is **modelled on Gladkokken** on desktop (the same font sizes, a wide layout, an ingredient panel on the right, gold step squares) and **on Matprat on phones** (the ingredients in the page, a section bar under the header, and cooking mode). Details in [05 – Design](05-design.md).

```
Desktop (from lg:)                                        Phones
┌────────────────────────────────────┬────────────────┐   ┌──────────────────┐
│ ← Alle oppskrifter                 │ INGREDIENSER   │   │ photo            │
│ RecipeImage (photo / placeholder)  │ ·············· │   │ Skriv ut · Kopier│
│ Skriv ut · Kopier lenke            │ [−][2][+] pors.│   │ Laksewrap        │
│ Laksewrap              (44px)      │ ·············· │   │ intro, meta      │
│ intro                  (22px)      │ 300 g laks     │   ├──────────────────┤
│ 30 min · 2 porsjoner · Fisk · Rask │ …   (sticky)   │   │(Ingredienser)(Sl…│ ← sticks under
│ Slik gjør du                       │                │   ├──────────────────┤   the header
│ [Behold skjermen på        ○]      │                │   │ INGREDIENSER     │
│ ▣ 1 ···························    │                │   │ [−][2][+] pors.  │
│ text (18px)                        │                │   │ 300 g laks …     │
└────────────────────────────────────┴────────────────┘   │ Slik gjør du     │
   the header's width; the panel colour continues         │ [Behold skjermen]│
   to the screen edge                                     │ ✓ 1 ··· (done)   │
                                                          │ ▣ 2 ·········    │
                                                          └──────────────────┘
```

**Two components in one file:**
- `RecipePage` gets the recipe from its loader (`recipeLoader` reads `:id` from the address and calls `getRecipe(id)`). Unknown recipe → `NotFoundPage`.
- `RecipeView` draws it, and holds the **number of portions** in state.
- `RecipePage` gives `RecipeView` a `key={recipe.id}`. When you move to another recipe, React starts `RecipeView` afresh, so the portions start at the new recipe's own number.

**Lined up with the header:** the main column and the panel sit in a container with the header's width (`max-w-7xl`); the main column has the header's left padding (`px-4 md:px-8`), and the panel `pr-8`, so the title starts under the logo and the ingredients end under the menu.

**The panel to the screen edge:** the main column and the panel sit in that container. To make the panel colour continue to the right edge on wide screens, the `<article>` gets a background that's white on the left half and panel-coloured on the right half (`linear-gradient(to right, white 50%, panel 50%)`). The main column is white on top of it, so the panel colour only shows to the right of the main column.

**The ingredients appear twice in the code, but only once on screen:**
- **Desktop:** `IngredientsPanel` in a side panel (`hidden lg:block`), with sticky content that scrolls on its own if the list is taller than the screen.
- **Phones and paper:** the same `IngredientsPanel` in the page, before the steps (`lg:hidden print:block`), in the panel colour from edge to edge. Both get the **same** `servings`.

**The section bar on phones** (`RecipeSectionNav`, like Matprat's): «Ingredienser · Slik gjør du · Tips», only the parts the recipe has (`recipeSections` in `display.ts`), and only with two or more. It sticks just under the header: `Header` measures its own height with a `ResizeObserver` and puts it in the CSS variable `--header-height`, and the bar uses `top-[var(--header-height)]`. Tapping scrolls to the part (smoothly, unless the phone asks for less motion); each part has a `scroll-mt-…` as tall as the header and the bar, so its heading isn't hidden. The part you're reading is dark: on every scroll, the last part whose top has passed under the bars (and the last part at the very bottom).

**Cooking mode:**
- **«Behold skjermen på»** (`KeepScreenOn` + `useWakeLock`) above the steps: a switch that asks the browser to keep the screen on (the Screen Wake Lock API; Safari on iPhone from iOS 16.4). The browser lets go when you switch app, so it asks again when the page is visible. Not remembered, and hidden where the browser can't do it.
- **Tick off steps:** the gold number is a button (`aria-pressed`); pressed, it shows ✓ and the step turns grey. Kept only while the page is open.

**The line under the introduction** (`RecipeMeta`): time, portions and **difficulty** (with four small bars, filled up to the level: the place in `difficulties` in `types.ts`), then the labels from `recipeLabels` (`display.ts`): main ingredient, **cuisine**, "Rask", the tags and the themes ("Passer til"). Each part only when the recipe has it. **The labels are links** to the overview filtered on them («Italiensk» → `/oppskrifter?kjokken=Italiensk`, made by `filterLink` in `filter.ts`): each label knows its filter group. «Rask» links to «Rask (inntil 30 min)», a choice in «Tid» made from the same rule (`quickOption` and `isQuick` in `types.ts`), so the label and the filter always mean the same.

**Portions:** `PortionStepper` changes `servings`. `IngredientsPanel` computes `scale = servings / baseServings` and passes it to `IngredientList`, which multiplies every amount: 2 → 4 portions turns 300 g into 600 g, and ½ løk into 1.

**Actions:** "Skriv ut" opens the browser's print dialog. "Kopier lenke" copies the address and shows "Lenke kopiert" for 2 seconds.

## 6. The overview page (`/oppskrifter`)

Desktop (from lg:), the top in two columns:

```
Oppskrifter                                   ┌─────────────────────────────┐
Finn noe godt å lage!                         │ ┌──────┐ HVA MED…           │  ← RecipeSuggestion, as tall
[🔍 Søk i oppskrifter      ] [⚙ Filter]       │ │photo │ Laksewrap?         │    as the left column
(Alle) (Frokost) (Lunsj) … (Tilbehør)         │ └──────┘ ↻ Vis et annet …   │    ("Pizzatid!" on Fridays)
                                              └─────────────────────────────┘
```

Phones and tablets, one column (and the rest of the page on every screen):

```
Oppskrifter
Finn noe godt å lage!
┌ HVA MED… Laksewrap? ─────────┐                                   ← RecipeSuggestion ("Pizzatid!" on Fridays)
[🔍 Søk i oppskrifter        ✕] [⚙ Filter 2]                       ← SearchField + FilterPanel
(Alle) (Frokost) (Lunsj) (Middag) (Dessert) (Bakst) (Tilbehør)   ← CategoryChips (shortcut to "Måltid")
(20–40 min ✕) (Uten løk ✕)                                         ← ActiveFilters
4 oppskrifter              Sorter [Nyeste ▾]  [▬] [▦] [☰]      ← count + SortSelect + ViewToggle (Store, Standard, List)
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ photo│ │ photo│ │ photo│ │ photo│                              ← RecipeCard (variant "card")
│Title │ │Title │ │Title │ │Title │
│10 min│ │30 min│ │1 t 30│ │20 min│
└──────┘ └──────┘ └──────┘ └──────┘
```

**How it works:**
- **The width** is the header's (`max-w-7xl`, `px-4 md:px-8`), so the heading starts under the logo and the cards end under the menu.
- **The top, from lg:** a grid with a fixed right column (26rem, 34rem from xl) and `grid-rows-[auto_auto_1fr]`. The suggestion is placed in the right column over all three rows (`col-start-2 row-start-1 row-span-3`); the heading, and the search + chips (one box), go down the left column. The box is `w-fit` from lg: as wide as the chips on one line, and the search row fills it, so search + Filter end where «Tilbehør» ends. Spanning the rows makes it exactly as tall as the left column (the box is `lg:h-full`, content centred), so both sides end at the same line. The last row is `1fr`, so if the card is ever taller, the extra height goes there instead of spreading out the left column. On phones the same elements simply follow the order of the code (heading, suggestion, search, chips). `RecipeSuggestion` is always a row, picture on the left, text on the right: a square picture on phones, and from lg 4:3 like the recipe cards (`aspect-[4/3]`, the height set and the width from the aspect ratio), and from lg it has no border.
- **The state** lives in `RecipeListPage`: `view` (`"large"`, `"standard"` or `"list"`; remembered in this browser, see "The views"), `day` and `suggestion` (for "Hva med…?"). The **filters live in the address**, not in `useState`: `filters = filtersFromParams(searchParams, recipes)` on every render, and the page's own `setFilters` writes them back with `filtersToParams`. `filters` has `query` (the search text, `""` = no search) and `chosen`, the ticked options per filter group (`{ category: ["Middag"], time: ["20–40 min"] }`; missing or `[]` = nothing ticked).
- **The order** (`SortSelect`, `recipes/sort.ts`): Nyeste (the default: `createdAt`, newest first), A–Å (by title, the Norwegian way) and Raskest (the shortest time first; recipes without a time last). Kept in the address like the filters, `?sortering=raskest`, and left out for Nyeste. The page writes the filters and the order together (`writeAddress`), so changing one keeps the other. Sorting comes after filtering, on every render; nothing is stored.
- **The address:** `/oppskrifter?sok=laks&maltid=Middag&maltid=Lunsj&kjokken=Italiensk`. The search is `sok`; each group uses its `param` (Norwegian, only a–z and `-`); several options repeat the name. Values are written as they are and encoded by `URLSearchParams`. Reading an address keeps only values the panel could have ticked, so an old or hand-typed link (`?kjokken=Marsiansk`) can't break anything. The first letter typed in the search adds a step to the history and the next ones replace it, so one press on back clears the search. Changing the filters doesn't scroll to the top (`preventScrollReset`), and doesn't fetch the recipes again: the route's `shouldRevalidate` says no when only the `?…` part changed ("Prøv igjen", which keeps the address, still fetches).
- **Back to the same list:** the cards (and "Hva med…?") bring the list's `?…` part to the recipe page in the link's `state` (`recipes/listLink.ts`), so "← Alle oppskrifter" goes back to the filtered list, also after a reload. A recipe opened from a shared link has no `state`, and goes to the plain list.
- **Search** looks in the title, the description and the ingredient names. It ignores upper/lower case and spaces at the ends, but the field still shows exactly what was typed: the cleaning happens in `filterRecipes`, not in the state. The placeholder is short ("Søk i oppskrifter") so it fits next to the Filter button on phones.
- **The filter panel** (`FilterPanel`, with one `FilterGroupSection` per group; the "Filter" button is next to the search, only the icon on phones) is a `<dialog>`: a sheet from the bottom on phones (at most 90% of the screen, rounded top corners), a full-height panel from the right on desktop. It slides in and out (`starting:` and `transition-discrete`; off for people who've turned off animations), and the backdrop fades. Ticked options are dark with a ✓, and everything has a focus ring for the keyboard (`focusRing`). It has one section per group in `filterGroups` (`recipes/filter.ts`), each opens and closes: **Måltid, Hovedingrediens, Tid, Vanskelighetsgrad, Kjøkken, Passer til, Tilpasninger, Har ingredienser, Uten ingredienser**. Each option shows how many recipes it gives, and is greyed out at 0. Long lists (the ingredients) show the 10 most used first (`mostUsedOptions`), and "Vis alle". Everything applies right away; "Vis 4 oppskrifter" just closes the panel, "Nullstill" unticks everything but keeps the search.
- **How the groups combine:** "and" between groups. Within a group it's the group's `combine`: `"any"` (Kylling or Fisk; meal type, main ingredient, time, difficulty, cuisine), `"all"` ("Passer til", "Tilpasninger" and "Har ingredienser": every one), `"none"` ("Uten ingredienser": none of them).
- **The category chips** are a shortcut to "Måltid" (the same state, `filters.chosen.category`): several can be on, "Alle" unticks them. A recipe without a category only shows when no meal is ticked.
- **The chosen filters** (except the meals, which the chips show) are small chips with ✕ above the cards. "Uten" options say so: "Uten løk".
- **The search field** (`SearchField`) has a magnifying glass, a ✕ that clears it and puts the cursor back, and 16px text, so iPhones don't zoom in when you tap it. The browser's own ✕ is hidden, since we have our own.
- **The recipes to show** are calculated on every render, never stored: `visibleRecipes = filterRecipes(recipes, filters)`. The count, the cards and the empty state all read from it.
- **`filterRecipes`** (in `recipes/filter.ts`) is a pure function with tests, like `calculateDough`. **To add a filter group:** one entry in `filterGroups` (id, param, label, combine, options, matches, and `hasInfo` if not every recipe has the information), plus a test. The panel, the counts and the chips pick it up by themselves. If it's a new field on the recipe, add it to `types.ts` and to the Datasjekk (`checks` in `completeness.ts`).
- **The views:** the list of views is `recipeViews` in `components/recipe/recipeView.ts`, and the type `RecipeView` is made from it. Two lookups in the page pick, for each view, the grid's classes (`layouts`) and the card's variant (`cardVariants`). "Store" (`large`) is big cards: 1 per row on phones, 2 from 640 px, 3 from 1280 px. "Standard" is 2 cards per row on phones and up to 4 on desktop. "List" is compact rows (`variant="row"`), in two columns on desktop. Each card variant gives the photo its own `sizes`, matching the grid, so the browser fetches a photo that's sharp enough and no bigger (a big card on a phone gets `w=1280`, a standard one `w=640`). **The chosen view is remembered** in this browser (`localStorage`, key `recipeView`), not in the address: it's a preference, not what you're looking at, so a shared link doesn't bring it along. `readSavedView` checks the saved text against `recipeViews` and falls back to "standard" for an old value or blocked storage (with tests). **To add a view:** one entry in `recipeViews`, then TypeScript points out `layouts` and `cardVariants` (both `Record<RecipeView, …>`); the button in `ViewToggle`'s `options` you must remember yourself, since a list with a view missing is still a valid list.
- **"Hva med…?"** (under the subtitle): one suggested recipe, with a "Vis et annet forslag" button. The rules are in `recipes/suggest.ts`, as pure functions with tests. `pickSuggestion(recipes, day, current)` picks a complete dinner that suits the day (Monday–Friday "Ukedag", Saturday "Helgemat", Sunday either: see `occasions` in section 2), never the same one twice in a row. If nothing suits, it falls back to any dinner, then any complete recipe, and only shows nothing if there are no complete recipes. On **Fridays** (`isPizzaDay`) the page shows "Pizzatid!" with a link to the pizza calculator instead. **The look** is in `components/recipe/RecipeSuggestion.tsx`: `RecipeSuggestion` and `PizzaSuggestion` share one box (`SuggestionBox`: square picture, small label, title, thin border), reusing `CardPhoto` and `CardDetails` from the cards. The whole box is clickable through a "stretched link" on the title, with the "Vis et annet forslag" button lifted above it. The page decides the width: the box and the search field sit in one `max-w-xl` wrapper. The page reads the weekday **once**, into state (`day`), and passes it in, so the functions never read the clock and the tests can pretend it's any day.
- **When nothing matches:** "Fant ingen oppskrifter", with the search text in the message ("Ingen oppskrifter passer med «laks» og filtrene du har valgt."), and a "Vis alle oppskrifter" button that resets every filter, the search too.

### How to add a filter group

Every group in the panel is **one entry** in `filterGroups` (`recipes/filter.ts`). The panel, the counts, the chips above the cards and the "Filter" number all read that list, so they pick up a new group by themselves.

An example: a "Sesong" (season) filter.

**1. If it's new information on the recipe, add it to `types.ts`:** a fixed list, a type made from it, and an optional field.

```ts
export const seasons = ["Vår", "Sommer", "Høst", "Vinter"] as const;
export type Season = (typeof seasons)[number];

// in interface Recipe:
seasons?: Season[]; // missing = not filled in yet; [] = all year
```

**2. Add the entry to `filterGroups`**, where you want it in the panel:

```ts
{
  id: "season",               // the name in the code
  param: "sesong",            // the name in the address (?sesong=Sommer): Norwegian, only a–z and "-"
  label: "Sesong",            // the heading in the panel
  combine: "any",             // "any" = or, "all" = every one, "none" = none of them
  options: () => seasons,     // what you can tick
  matches: (recipe, option) => (recipe.seasons ?? []).some((season) => season === option),
  hasInfo: (recipe) => recipe.seasons !== undefined, // leave out if every recipe has an answer
},
```

- **`combine`:** "any" when a recipe has *one* value, or when ticking more should give *more* recipes (Kylling or Fisk). "all" when ticking more should *narrow it down* (Glutenfri and Laktosefri). "none" to hide recipes (Uten løk).
- **`hasInfo`:** a recipe without the information is hidden while something in this group is ticked, since we can't know if it fits. Leave it out when every recipe has an answer: `tags` is always there, and `[]` means "none apply".
- **Worked out instead of stored?** Use a function in `matches`, like "Tid" does with `timeRangeOf(recipe)`. Then there's nothing to fill in.

**3. Add it to the Datasjekk** (`checks` in `recipes/completeness.ts`), if it's something recipes should have filled in:

```ts
{ label: "Sesong", has: (recipe) => recipe.seasons !== undefined },
```

**4. A test** in `filter.test.ts`: a few made-up recipes with `makeRecipe`, one that matches, one that doesn't, and one without the information. See `describe("time, difficulty and cuisine")` for an example. Run `npm test`.

**5. Fill it in** on the recipes in `data.ts`. The Datasjekk (`/oppskrifter/datasjekk`) shows which ones are missing it.

## 7. The plan going forward

| Step | Status |
|---|---|
| Data model, example data, data layer | ✅ done |
| The recipe page, with its own look | ✅ done |
| Ingredient groups | ✅ done (`group`) |
| Change the number of portions | ✅ done (`PortionStepper`) |
| The ingredients in the page on phones, a section bar, and cooking mode (like Matprat) | ✅ done (`RecipeSectionNav`, `KeepScreenOn`, `StepList`) |
| The overview page `/oppskrifter`, with cards, grid/list view and category filter | ✅ done |
| Search (title, description, ingredients) | ✅ done |
| Incomplete recipes (only a title required, "Uferdig" label) | ✅ done |
| The filter panel (meal type, main ingredient, time, difficulty, cuisine, "Passer til", diet, with and without ingredients) | ✅ done (`filterGroups`, `FilterPanel`) |
| Datasjekk: which recipes are missing what | ✅ done (`/oppskrifter/datasjekk`) |
| A CMS (Sanity), the API and the login | ✅ done (tasks 6, 5a, 5b) |
| Post and edit on the site itself: quick posting and «Rediger» (the admin mode) | ✅ done (task 5c, [09](09-history.md) section 30) |
| Photos | add `image` to a recipe, with the file in `public/images/recipes/`. Without one, a calm placeholder is shown |
| CMS / phone app | see below |

### Later: CMS and a phone app

**Chosen: Sanity.** The plan, step by step, is task 6 in [10](10-tasks.md).

To post recipes with a photo from the phone, the recipes have to live somewhere other than the code. Two common routes:

| Route | Examples | Good for |
|---|---|---|
| **Headless CMS** | Sanity, Contentful, Strapi | A ready-made admin tool with forms and image upload, which also works on a phone. Quick to get going |
| **Database + image store** | Supabase, Firebase | Building your own app and forms. More work, more learning |

Either way, the **shape** in `types.ts` moves over to the CMS or database, and `recipes.ts` starts fetching from there. That's why those two files were made first.

**Before the switch** (task 4 in [10](10-tasks.md)): a translation at the border (`toRecipe`, so data from outside can't crash a page), a data layer that waits for its data (with loading and error states on the pages), and a Datasjekk line for almost-the-same ingredient names. After that, the switch is mostly configuration; the plan is under "Later: online" in [10](10-tasks.md).

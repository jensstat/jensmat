# 07 – How to …

Common tasks, step by step. After each one: `npm test` and `npm run build`.

---

## … add a recipe

1. Open `src/recipes/data.ts` and copy an existing recipe inside the list.
2. Change the fields. Pay attention to:
   - **`id`**: lowercase, hyphens instead of spaces, no æøå: `"kylling-i-karri"`. It becomes the address `/oppskrifter/kylling-i-karri`. Never change it once it's in use.
   - **`category`, `protein`, `tags`, `themes`, `cuisine`, `difficulty`**: must be from the lists in `types.ts`. A typo gives a red underline. Only `title` is required; leave out what you don't know yet.
   - **Ingredients**: `amount` as a number (`0.5`, not `"½"`), only the ingredient in `name` (`"løk"`), and "finhakket" (finely chopped) or alternatives in `note`. Use the same name as in your other recipes, so the filter works: see [03](03-recipes.md), "Writing ingredients so the filter works".
   - **`createdAt`**: today's date as `"2026-11-09"`.
3. Open `localhost:5173/oppskrifter/<id>`, and `localhost:5173/oppskrifter/datasjekk` to see what's still missing.

**With a photo:** put the file in `public/images/recipes/` (keep it under ~300 KB), and add `image: "/images/recipes/<file>.jpg"`.

---

## … add a new page

1. Create `src/pages/MyPage.tsx`. Start from `NotFoundPage.tsx`: it's the smallest page, and uses `Container`.
2. In `routes.tsx`, import it and add a route **above** the `path: "*"` route:
   ```tsx
   { path: "/my-address", element: <MyPage /> },
   ```
   If the page needs data (recipes), add a `loader` in `loaders.ts` too, and read it in the page with `useLoaderData()`.
3. If it should be in the menu, add it to `navLinks` in `Header.tsx`.

---

## … add a number field to the pizza calculator

1. In `src/pizza/settings.ts`: add the field to `PizzaSettings`, and a value in `defaults`.
2. In `PizzaCalculatorPage.tsx`, in the right `FieldGroup`:
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
3. If it affects the grams, use it in `pizza/calculateDough.ts`, and add it to the `NaN` check at the top.
4. Add a test in `calculateDough.test.ts`.

---

## … add a pizza type

Add an entry to `pizzaStyles` in `src/pizza/settings.ts`, with `label`, `hint` and `values`. The dropdown updates by itself.

---

## … add a category, main ingredient, tag, theme, cuisine or difficulty

Add the value to its list in `src/recipes/types.ts` (`categories`, `proteins`, `tags`, `themes`, `cuisines` or `difficulties`). The type updates by itself, the filter panel shows the new option, the Studio offers it, and the API (`PATCH`) accepts it.

---

## … log in as the admin

Go to `/logg-inn` (not in the menu, so bookmark it) and log in with Google. You stay logged in after a reload. Only your Google account gets through the API's lock: `api/_auth.ts` checks that the token's user id is `ADMIN_UID`. To call the API from the site, use `adminFetch` from `src/auth/adminFetch.ts` instead of `fetch`. Locally, run `vercel dev` (not `npm run dev`), because only it runs `api/`.

**If the login stops working online:** check that Vercel's Environment Variables have `ADMIN_UID` and `VITE_FIREBASE_PROJECT_ID` (then Redeploy), and that the site's address is under Authorized domains in Firebase (Authentication → Settings).

---

## … let the API change a new field

Add a line to `editable` in `api/_changes.ts`, with a check (`text`, `wholeNumber`, `oneOf(list)` …), and a test in `api/_changes.test.ts`. Anything not in `editable` is refused, on purpose. Then `npm test`, and `npm run test:api` with `vercel dev` running.

---

## … add a filter group

One entry in `filterGroups` (`src/recipes/filter.ts`), plus a test. Step by step, with an example: [03](03-recipes.md), "How to add a filter group".

---

## … change the yeast calculation

Everything is in `src/pizza/yeast.ts`. Afterwards, `npm test` checks the chart, and that the house recipe still gives 3 g with "Hjemmeoppskrift".

---

## … write a test

Tests live next to the file they test: `something.ts` → `something.test.ts`. The pattern:

```ts
import { describe, expect, it } from "vitest";
import { formatMinutes } from "./display";

describe("formatMinutes", () => {
  it("writes hours and minutes", () => {
    expect(formatMinutes(75)).toBe("1 t 15 min");
  });
});
```

- `describe` groups tests, and `it` is one test. Write the name as a sentence about what *should* happen.
- `expect(actual).toBe(expected)`. Use `toEqual` for lists and objects, and `toBeCloseTo` for decimal numbers.
- `npm run test:watch` runs the tests every time you save, which is handy while you work.
- **Recipes in tests:** use `makeRecipe({ … })` from `recipes/testRecipe.ts`, and give only the fields the test is about. Then the tests don't break when `data.ts` changes.

**Is the test useful?** Break the code on purpose and check that the test fails. A test that never fails doesn't protect anything.

---

## … find out why something looks wrong

1. **A style doesn't show up?** Check the spelling of the class. Tailwind ignores unknown classes without a warning.
2. **Something is in the wrong place?** Check where `</div>` tags close. A grid only places its *direct* children.
3. **A red underline?** Read the *last* line of the error message first; it usually says what's wrong.
4. **Something wrong in the browser?** Open the developer tools (F12), and look at the *Console* tab for red messages.
5. **Wrong on phones?** Developer tools → the phone icon → pick a phone, and check at 360px.

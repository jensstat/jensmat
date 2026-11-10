# 08 – Status

Where the project stands: what works, what's missing, and known issues. **Update this file when something changes.**

*Last checked: 10 November 2026. Type check, lint, 76 tests and the build all pass. Every page was checked in the browser at phone and desktop width: no errors, no sideways scrolling.*

**What to do next is in [10 – Tasks](10-tasks.md).** This file is about what works and what's known to be wrong.

---

## What works

| Part | Address | Status |
|---|---|---|
| Front page | `/` | ✅ Heading, subtitle, two buttons |
| Pizza calculator | `/pizza` | ✅ Pizza types, grams, yeast from the forum chart, method with clock times, fridge rises |
| Recipe overview | `/oppskrifter` | ✅ Recipe cards, search (title, description, ingredients), category filter, grid/list view, a message when nothing matches |
| Incomplete recipes | | ✅ Only the title is required. Cards and recipe pages show only what's filled in, and "Uferdig" until there are ingredients |
| Recipe page | `/oppskrifter/:id` | ✅ Modelled on Gladkokken: wide layout, ingredient panel, portion selector, groups, an ingredient menu on phones, print and copy link |
| Unknown addresses | anything else | ✅ "Fant ikke siden" |
| Menu | | ✅ Shows the current page; the back button and reload work |
| Tests | `npm test` | ✅ 76 tests: yeast chart, dough maths, method, text formatting, the overview filter and search, incomplete recipes, and a check of every recipe in `data.ts` |

---

## Known issues

Found during a full review of the code. Sorted by how much they matter.

### Important

**1. ~~`/oppskrifter` has no page yet.~~** ✅ Fixed: the overview page exists, so the menu link, the front page button and "← Alle oppskrifter" all work.

### Small

**2. The browser tab says "mat-nettside".**
The `<title>` in `index.html` is still the project's folder name. → Change it to "Jens matnettside".

**3. The site's name differs.**
The logo says "Jens matnettside", the footer "Min matnettside", and the front page heading "Jens sin oppskriftsbank". → Decide on one name. The logo and footer at least should match.

**4. ~~Typo in the recipe text.~~** ✅ Fixed.

**5. Leftover colour in `App.tsx`.**
The outer `<div>` has `bg-gray-50`. It isn't visible (every page has a white background), but it's the only `gray-*` colour left; the rest of the site uses `neutral-*`. → Change it to `bg-white`, or remove it.

**6. Two knowledge files borrow types from components.**
`pizza/settings.ts` uses `SelectOption` from `SelectField`, and `pizza/calculateDough.ts` uses `ResultRow` from `ResultPanel`. It works, but breaks the rule that `pizza/` doesn't depend on the UI (see [01](01-architecture.md)). → Move the two types into `pizza/` (or a shared `types` file), and let the components import them from there.

**7. `Container` is only used by one page.**
`HomePage` and `PizzaCalculatorPage` still write the same width classes themselves (`RecipePage` is deliberately wider). → Switch them to `Container`, so the width is set in one place. (`HomePage` needs its own vertical centring, so check that it still looks right.)

### Worth knowing (not bugs)

**8. The yeast chart guesses outside its range.** Very short or very long rises, or a short rise in the fridge, give an extended line rather than data. For example, 3 h at 4 °C gives an absurd amount of yeast. The field limits keep most settings reasonable.

**9. "Today" in the method is read when the page opens.** If the page is left open past midnight, the weekdays on long rises are a day off until you reload. Hardly matters in practice.

**10. Field labels include more than the name.** In `NumberField`, the whole row is a `<label>`, so a screen reader reads e.g. "Hydrering 61 % Vanlig: 60–70 %" as the field's name. It works, but could be more precise (`aria-describedby` for the hint).

**11. Publishing needs one setting.** When the site is put online (Netlify, Vercel …), the server must send every address to `index.html`, otherwise reloading on `/pizza` gives the host's own 404 page. Each host has a short guide for "single page apps".

**12. The recipe pages are wider than the header.** The recipe content can start further left than the logo, because the recipe pages are up to 1500px wide and the header 1152px. That was agreed ("more widescreen"). If it bothers you, the header could follow the page width.

**13. Printing prints the whole page.** "Skriv ut" prints the header, the menu and the photo placeholder too. A print style (`print:hidden` on more elements) can make it tidier.

---

## Next steps

Moved to **[10 – Tasks](10-tasks.md)**, which is kept up to date as the to-do list.

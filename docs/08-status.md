# 08 – Status

Where the project stands: what works, what's missing, and known issues. **Update this file when something changes.**

*Last checked: 9 November 2026. Type check, lint, 38 tests and the build all pass. Every page was checked in the browser at 360px and 1400px: no errors, no sideways scrolling.*

---

## What works

| Part | Address | Status |
|---|---|---|
| Front page | `/` | ✅ Heading, subtitle, two buttons |
| Pizza calculator | `/pizza` | ✅ Pizza types, grams, yeast from the forum chart, method with clock times, fridge rises |
| Recipe page | `/oppskrifter/:id` | ✅ Modelled on Gladkokken: wide layout, ingredient panel, portion selector, groups, an ingredient menu on phones, print and copy link |
| Unknown addresses | anything else | ✅ "Fant ikke siden" |
| Menu | | ✅ Shows the current page; the back button and reload work |
| Tests | `npm test` | ✅ 38 tests: yeast chart, dough maths, method, text formatting, and a check of every recipe in `data.ts` |

---

## Known issues

Found during a full review of the code. Sorted by how much they matter.

### Important

**1. `/oppskrifter` has no page yet.**
Three places link there: **the "Oppskrifter" menu link**, the **"Oppskrifter →" button on the front page**, and **"← Alle oppskrifter"** on the recipe page. All three show "Fant ikke siden" today. → *Fixed by the next step: the overview page with recipe cards.*

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

In the order I'd suggest:

1. **The overview page `/oppskrifter`** with recipe cards, in the recipe section's look. Fixes issue 1. Reuses `LabelList`, `RecipeImage` and `formatMinutes`.
2. **The small fixes 2–5.** About 10 minutes in total.
3. ~~**Change the number of portions**~~ ✅ Done.
4. **Search and filter** recipes.
5. **Test-bake** "Forum-basert" vs "Hjemmeoppskrift", and adjust the yeast.
6. **Publish the site** (remember issue 11).
7. **CMS / phone app** for posting recipes with photos. See [03](03-recipes.md).

### Ideas for later

- [ ] Remember the pizza settings when the page is reloaded (`localStorage`)
- [ ] Share a pizza recipe as a link (settings in the address)
- [ ] The 48 h+ yeast chart (forum reply #406), for very long rises
- [ ] Sourdough, with its own calculation (hidden for now)
- [ ] Front page: "Nyeste oppskrifter" (newest recipes) and "Hva skal vi spise i dag?" (a random recipe)
- [ ] A tab bar at the bottom on phones (fits with a phone app)

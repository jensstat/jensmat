# 05 – Design

The site has **two looks**:
- **The frame and the calculator** (header, menu, front page, `/pizza`): black and white, Anton and a typewriter font, square lines, a red accent. Inspired by Stadler Made. Sections 1–6 below.
- **The recipe section** (`/oppskrifter/…`): calmer, made for reading while cooking: a serif and a sans-serif, a light panel colour and a gold accent. Modelled on Gladkokken. Section 7.

This file collects the rules, so new pages fit in.

---

## 1. Fonts

Loaded from Google Fonts in `index.html`, and registered in `src/index.css`:

```css
@theme {
  --font-display: "Anton", sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
}
```

| Class | Font | Used for |
|---|---|---|
| `font-display` | **Anton**: tall, narrow, heavy | Headings, big numbers (grams, facts), step numbers. Almost always `uppercase` |
| `font-mono` | **IBM Plex Mono**: typewriter | Everything else: text, labels, fields, menu |

Pages set `font-mono` once on their outermost element, and everything inside inherits it.

**Tip:** Anton is already bold. Don't add `font-bold`. With very large sizes, `leading-[0.9]` pulls the lines closer together.

---

## 2. Colours

| Colour | Class | Used for |
|---|---|---|
| Black | `black` | Text, the input boxes, thick lines, the filled button |
| White | `white` | Background |
| Gray | `neutral-200` | Thin lines between rows |
| | `neutral-500` / `neutral-600` | Secondary text: hints, labels, descriptions |
| **Red** (the only accent) | `red-600` | **Sparingly:** focus on fields, hover on links and buttons, the "STEG 1" labels |

**Use `neutral-*`, not `gray-*` or `stone-*`.** Neutral is a pure gray, which suits black and white. 

**Why so little red:** the accent only stands out when it's rare. If everything is red, nothing is.

---

## 3. Lines and shapes

- **Square corners everywhere.** No `rounded-*`.
- **Black, 1px** (`border border-black`): input boxes, buttons, labels, the fact strip, the header's bottom line.
- **Light gray** (`divide-y divide-neutral-200` + `border-y border-neutral-200`): lines between rows in a list. `divide-y` puts a line *between* the children; `border-y` adds one above the first and below the last.
- **No shadows.**

---

## 4. Layout and spacing

**The width:** everything is centred with the same classes as the header, so content lines up with the logo:

```
mx-auto w-full max-w-6xl px-4 md:px-8
```

Use the `Container` component for new pages. It does exactly this, plus vertical padding.

**Mobile first:** classes without a prefix are for **phones**. `sm:` (640px), `md:` (768px), `lg:` (1024px) and `xl:` (1280px) override them on bigger screens. Example from `ResultPanel`:

```
bg-black p-6 text-white          ← phones: a black box
lg:bg-transparent lg:p-0 lg:text-black   ← desktop: a plain list
```

**Two columns from `lg:`:** the calculator (settings | result) and the recipe page (ingredients | steps) are one column on phones, two from `lg:`. Use `minmax(0, …)` in the grid, so long words can't push a column wider than the screen.

**Same number, same alignment:** to make two things line up, give them the same spacing. The headings in `FieldGroup` have `mb-4`, and the result list has `mt-4`, so the lines in the two columns are at the same height.

---

## 4b. Text size on large screens (90 %)

On screens **1280px and wider**, the whole site is **90 %** of the normal size. This was chosen by testing browser zoom levels on a 14" MacBook Pro (110 % and 100 % were tried first). Phones and tablets keep the normal 16px, where smaller text would be hard to read.

It's one rule in `src/index.css`:

```css
@media (width >= 80rem) {          /* from 1280px wide */
  html { font-size: 90%; }         /* everything 10 % smaller */
}
```

**Why it works:** almost every size in Tailwind is in `rem`, and `1rem` = the font size of `<html>`. When that goes from 16px to 14.4px, all text, spacing and widths shrink together, so the proportions stay the same. **To change the size, change the percentage.**

**Two rules that follow from it:**
1. **Write sizes in `rem`, not `px`,** so they follow along: `text-[2.75rem]`, not `text-[44px]` (divide px by 16). The only px value is the 3px dotted line under the step numbers.
2. **No text under `text-sm`.** That's 14px on phones and 12.6px on large screens; anything smaller gets hard to read.

| | Phones | Large screens (90 %) |
|---|---|---|
| Recipe: steps and ingredients | 16px | **16.2px** |
| Recipe: title | 26px | **39.6px** |
| Calculator: fields and labels | 16px | **14.4px** |
| Calculator: hints | 14px | **12.6px** |

**Checking sizes:** press **⌘ 0** first, so the browser itself is at 100 %. Otherwise the browser's zoom comes on top of the 90 %.

## 5. Recurring patterns

| Pattern | Looks like | Example |
|---|---|---|
| **Section heading** | `font-display text-2xl uppercase` | "DEIG", "INGREDIENSER" |
| **Small label** | `text-xs uppercase tracking-wider text-neutral-500` | "TID" in the fact strip |
| **List with lines** | `divide-y` + `border-y`, `py-3` per row | the fields, the result, the ingredients |
| **Primary button** | `border border-black bg-black text-white px-6 py-3 uppercase`, red on hover | "Oppskrifter →" on the front page |
| **Secondary button** | the same, but white with a black line; black on hover | "Pizzakalkulator →" |
| **Label/tag** | `border border-black px-2 py-1 text-xs uppercase` | "FISK", "RASK" |
| **Focus (keyboard)** | red ring or outline | fields, buttons, tags |

---

## 6. Phones

- **Tap areas at least about 40px tall.** The menu links have `py-2` for that reason.
- **No sideways scrolling.** Check at 360px wide. Large headings get smaller sizes on phones (`text-5xl sm:text-7xl …`).
- **Buttons full width** on phones when there's room for only one per line.

---

## 7. The recipe section's own look (modelled on Gladkokken)

**Why a different look:** recipes are *read*, often while cooking. A typewriter font is great for numbers and settings, but tiring across longer text. The recipe section is therefore modelled on Gladkokken's recipe pages, measured value by value.

### Fonts

Gladkokken uses the commercial fonts *eskorte* and *motiva-sans*. The closest free ones:

| Class | Font | Used for |
|---|---|---|
| `font-serif` | **Source Serif 4** (semibold) | The title, "Slik gjør du", the step numbers |
| `font-sans` | **Figtree** | Everything else on the recipe pages. Set once on `<article>` |

### Sizes (the same as Gladkokken)

| | Phones | Desktop |
|---|---|---|
| Title | 26px / 32px line | **44px** / 56px |
| Introduction (light weight) | 18px / 28px | **22px** / 38px |
| Steps and ingredients | 16px / 24px | **18px** / 32px |
| Step number | 34px serif in a 50×50 square | same |

### Colours

Defined in `src/index.css`, so they become classes like `bg-panel`, `text-ink` and `bg-gold`:

| Colour | Class | Used for |
|---|---|---|
| Ink `#122222` | `text-ink`, `bg-ink` | All text (softer than pure black), the ingredient bar on phones. `text-ink/60` for lighter text |
| Panel `#efefe9` | `bg-panel` | The ingredient panel, labels, the photo placeholder, the tips box |
| Gold `#b0892a` | `bg-gold`, `border-gold` | **The only accent:** the step squares and their dotted lines, hover. A little darker than Gladkokken's, so the white numbers are readable |

### Layout

- **Up to 1500px wide**, with 40px side margins on desktop and 20px on phones. Wider than the rest of the site, so the content starts further left than the logo on most screens.
- **Desktop:** the main column + a 420px panel (480px from `xl:`). The panel colour continues to the right edge of the screen (see [03](03-recipes.md), "The panel to the screen edge").
- **Phones:** one column, and the ingredients behind a dark bar at the bottom of the screen.
- **Lines:** dotted lines around the portion selector and after each step number; thin solid lines (`border-ink/10`) between ingredients.
- **Readable line length:** the steps and introduction are kept to `max-w-3xl`.

### The filter panel and chips

- **Chips** (the meal chips and the options in the panel): `rounded-full`, `bg-panel`, at least 44px tall (`min-h-11`). **Chosen:** `bg-ink text-white`, and in the panel a ✓ in front, so it's not only the colour that tells. **Leads to nothing:** `opacity-40` and disabled. The count is small and quiet: `text-xs text-ink/45`, `tabular-nums`.
- **Chosen filters above the cards:** outlined chips (`border border-ink/20`) with a ✕, so they look removable, not choosable.
- **The panel:** a sheet from the bottom on phones (`rounded-t-2xl`, at most 90% of the screen, the page visible above it) and a full-height panel on the right on desktop (`max-w-md`). It slides in 0.3 s, and the backdrop (`bg-ink/40`) fades. Section headings are small capitals (`text-sm font-medium uppercase tracking-wider`) with a chevron, thin lines (`border-ink/10`) between them.
- **Keyboard focus:** a dark ring (`focusRing` in `components/focusRing.ts`), only for the keyboard (`focus-visible:`).
- **Primary button** in the recipe section: `bg-ink text-white`, gold on hover ("Vis 4 oppskrifter", "Vis alle oppskrifter"). **Secondary:** underlined text ("Nullstill", "Vis alle").

# 02 – The pizza calculator

The calculator lives at `/pizza`. You choose settings on the left, and get grams, a method and clock times on the right.

---

## 1. The files

| File | Layer | What it does |
|---|---|---|
| `pages/PizzaCalculatorPage.tsx` | page | Holds the settings in state, draws the fields, and passes the results on |
| `pizza/settings.ts` | knowledge | **What** can be set: the `PizzaSettings` type, `defaults` (the house recipe), the pizza types and the choices in the dropdowns |
| `pizza/calculateDough.ts` | knowledge | Settings → grams per ingredient |
| `pizza/yeast.ts` | knowledge | Rise time + temperature → how much yeast (the forum's yeast chart) |
| `pizza/method.ts` | knowledge | The steps of the method, and their clock times |
| `components/ResultPanel.tsx` | component | Shows the grams |
| `components/Instructions.tsx` | component | Shows the method, with the "Stekes kl." (bake at) time field |
| `pizza/*.test.ts` | tests | Check the three knowledge files |

---

## 2. How the data flows

```
pizza/settings.ts ── defaults ──┐
                                ▼
PizzaCalculatorPage   settings = useState(defaults)
     │                         ▲
     │ value                   │ update({ salt: 3 })
     ▼                         │
  NumberField / SelectField / ChoiceTags   (you type or click)
     │
     ├──▶ calculateDough(settings) ──▶ rows ──▶ ResultPanel     (grams)
     └──▶ settings ─────────────────────────▶ Instructions     (method)
                                                  └─ makeSteps(…), stepClock(…)
```

1. The page holds **one** object, `settings`, with every value in the fields.
2. Each field shows its value from `settings`. When you type, it calls `update({ … })` with only the field that changed.
3. React draws the page again. `calculateDough(settings)` works out the grams from scratch, and `Instructions` builds the steps from the same settings.

`update` is a small helper in the page:

```tsx
const update = (changes: Partial<PizzaSettings>) =>
  setSettings((prev) => ({ ...prev, ...changes }));
```

It copies all the old values (`...prev`), then puts the changed ones on top (`...changes`). It always makes a **new** object, because React only notices a change when it gets a new object.

**Choosing a pizza type** does the same thing with several fields at once: `update({ pizzaStyle, ...pizzaStyles[pizzaStyle].values })` saves the type *and* copies in its hydration, salt, sugar, oil and ball weight.

---

## 3. The maths: baker's percentages

Pizza bakers write everything as a **percentage of the flour weight**. 61 % hydration means water = 61 % of the flour. You know the total dough (number of pizzas × ball weight), so you work backwards to the flour:

```
total dough = number of pizzas × weight per ball
flour       = total dough ÷ ((100 + water% + salt% + sugar% + oil% + yeast%) / 100)
ingredient  = flour × ingredient% / 100
```

**Example, the house recipe:** 2 × 372 g = 744 g of dough, at 61 % water, 2.2 % salt, 1.1 % sugar and 0.67 % yeast:
`flour = 744 ÷ 1.6497 ≈ 451 g`, water = 451 × 0.61 ≈ 275 g, and so on.

The default settings (`defaults` in `settings.ts`) are **the house recipe worked backwards**: 450 g flour, 275 g water, 10 g salt, 5 g sugar, 3 g instant yeast, 2 pizzas, 3 h at 24 °C. A test checks that they give the recipe back (451 / 275 / 10 / 5 / 3 g; 451 rather than 450 because 371.5 g per ball is rounded to 372).

**«Husoppskriften»** under the subtitle (only shown after a change, `isHouseRecipe` in `settings.ts`) puts the house recipe back. The settings are **not** remembered between visits on purpose: the house recipe is what's usually baked, so the page always opens with it (decided 12 November).

`calculateDough` also:
- **returns no rows when a field is empty** (an empty number field is `NaN`, "Not a Number"), or when the rise time is 0. The result panel then shows "Fyll inn alle feltene" (fill in all the fields).
- **hides ingredients at 0 g**, for example oil.
- **rounds** grams to whole numbers, and yeast to one decimal.

---

## 4. The yeast (`pizza/yeast.ts`)

The amount of yeast is never typed in. It's **worked out from rise time and temperature**.

### The chart

The data is TXCraig1's yeast prediction model from the [Pizza Making Forum](https://www.pizzamaking.com/forum/index.php?topic=26831.0) (reply #261), built from many home bakers' results. The image is saved as `Yeast-Chart.jpg` in the root of the repo, and it's typed into `chartRows`:

```
              more yeast →
            0.003 %  0.006 %  …  0.320 %      ← chartYeast (columns, instant dry yeast %)
  35 °F       –        –      …    70
  …
  75 °F       65       39     …     2         ← hours until the dough is ready
  …
  95 °F       22       13     …     2
  ↑ chartRows (one row per °F)
```

The chart goes from **yeast → hours**, but the calculator needs **hours → yeast**. So `idyPercentFromChart(hours, tempC)`:
1. converts °C to °F, and finds the two rows the temperature lies between
2. in each row, reads "backwards": which yeast amount gives exactly that number of hours?
3. takes the in-between value of the two rows.

Between the chart's points it draws straight lines **on a logarithmic scale**. Yeast and time change by *multiplying* ("double the yeast ≈ just under half the time"), and straight lines on a log scale follow that kind of curve.

**Outside the chart** (very short or very long rises), the nearest line is continued. That's a guess, so treat extreme settings with care. A 3-hour rise in the fridge, for example, gives an absurd amount of yeast.

### Two ways to calculate ("Gjærberegning")

| Choice | What it does | House recipe gives |
|---|---|---|
| **Hjemmeoppskrift** (default) | The chart × `houseFactor` (about 3.1), so the house recipe (3 h at 24 °C) gives exactly 3 g | 3 g |
| **Forum-basert** | The chart as it is | about 1 g |

Both follow the same curve when you change the time or temperature. "Hjemmeoppskrift" just uses about 3 × as much yeast throughout. That suits short rises like the house recipe, but gives a lot of yeast for long, cold rises.

### Yeast types

Everything is calculated in **instant dry yeast** (IDY) and converted with `yeastStrength`:
- `tørr: 1` (dry yeast)
- `fersk: 3.125` (fresh yeast). The factor is from the chart's own CY row.

Sourdough is hidden for now: a starter contains flour and water too, so it needs its own calculation.

---

## 5. The method (`pizza/method.ts`)

`makeSteps(settings)` builds the steps, based on the house method:

```
mix (10 min) → oil on the ball → rest 30 min → first rise → divide into balls → second rise → bake
```

- **The rise time** ("Hevetid") is split up as: 30 min rest, then what's left is split **60 % first rise / 40 % in balls**. For 3 h, that gives 30 min + 1.5 h + 1 h, exactly the house method.
- **At 10 °C or below**, it counts as a **fridge rise**. The texts say "i kjøleskapet" (in the fridge), and an extra step "Ut av kjøleskapet" (out of the fridge) comes 1.5 h before baking.
- **The oven** goes on 45 min before baking: the stone needs at least 30.
- With **1 pizza**, step 5 says "Form bollen" (shape the ball) instead of "Del i 1" (divide into 1).

Each step knows **how many minutes before baking** it starts (`minutesBeforeBake`). That's what makes the clock times possible.

### Clock times

`Instructions` has a time field, "Stekes kl." (bake at), set to 18:00 by default. `stepClock(bakeAt, minutesBeforeBake)` counts back and rounds to 5 minutes. **House recipe, baking at 18:00:**

| Step | Time |
|---|---|
| Bland og elt lett (mix and knead lightly) | 14:50 |
| Olje på ballen / hvile (oil / rest) | 15:00 |
| Første heving (first rise) | 15:30 |
| Del i 2 / andre heving (divide / second rise) | 17:00 |
| Varm ovnen (heat the oven) | 17:15 |
| Form og stek (shape and bake) | 18:00 |

Steps on an earlier day (long rises) get the weekday in front, for example "søn. 17:50".

---

## 6. The tests

`npm test` runs these. They're worth reading, since they describe what the code *should* do in plain sentences.

| File | Checks, among other things |
|---|---|
| `yeast.test.ts` | That the chart is typed in correctly (every row and column must fall, so a misread number fails). That the chart's own values come back exactly. That the house recipe gives 3 g |
| `calculateDough.test.ts` | That the default settings give the house recipe. That every pizza type adds up to pizzas × ball weight. That empty fields give no result |
| `method.test.ts` | The clock times above. That the steps are always in time order. The fridge step, and the one-pizza text |

**If a test fails after a change:** either the change broke something, or the behaviour was *meant* to change and the test needs updating. The test's name tells you which rule was broken.

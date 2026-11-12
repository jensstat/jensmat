// The calculator's settings and all the choices: what can be set, the default values,
// and the pizza types. Only data, no React. The page and the calculation both read from here.

// One choice in a dropdown (SelectField) or a row of tags (ChoiceTags): the value that's
// saved, and the text that's shown. Here, not in the components: pizza/ doesn't depend on the UI.
export interface SelectOption {
  value: string;
  label: string;
}

// All the settings on the page. One object instead of many separate states,
// so the whole set can be passed to the calculation in one go.
export interface PizzaSettings {
  pizzaStyle: string;
  pizzaCount: number;
  ballWeight: number;
  hydration: number;
  yeastType: string;
  yeastModel: string;
  riseHours: number;
  riseTemp: number;
  salt: number;
  sugar: number;
  oil: number;
}

// Default settings, worked back from the house recipe:
// 450 g flour, 275 g water, 10 g salt, 5 g sugar, 3 g instant yeast, 2 pizzas, 3 h rise.
// Percentages are of the flour weight (baker's percentages).
// This is the starting value for useState.
export const defaults: PizzaSettings = {
  pizzaStyle: "klassisk",
  pizzaCount: 2,
  ballWeight: 372, // (450 + 275 + 10 + 5 + 3) / 2 = 371.5
  hydration: 61, // 275 / 450
  yeastType: "tørr",
  yeastModel: "hjemme", // gives the house recipe's 3 g
  riseHours: 3,
  riseTemp: 24, // room temperature
  salt: 2.2, // 10 / 450
  sugar: 1.1, // 5 / 450
  oil: 0,
};

// True when the settings are the house recipe (defaults), so the "Husoppskriften"
// button has nothing to do. Object.is, so an empty field (NaN) counts as changed.
export function isHouseRecipe(settings: PizzaSettings): boolean {
  return (Object.keys(defaults) as (keyof PizzaSettings)[]).every((key) =>
    Object.is(settings[key], defaults[key]),
  );
}

// ---------------------------------------------------------------------------
// Pizza types
// ---------------------------------------------------------------------------

interface PizzaStyle {
  label: string;
  hint: string;
  // The values filled in when the type is chosen. Everything can be adjusted afterwards.
  // Partial = only some of the fields in PizzaSettings (not rise time, yeast …).
  values: Partial<PizzaSettings>;
}

// Everything about a type in one place: name, hint and values.
// (Before, these were three separate lists that had to be kept in step.)
export const pizzaStyles: Record<string, PizzaStyle> = {
  klassisk: {
    label: "Klassisk (hjemmeovn)",
    hint: "Husoppskriften, laget for hjemmeovn",
    // The same numbers as in defaults, so they're only written once.
    values: {
      ballWeight: defaults.ballWeight,
      hydration: defaults.hydration,
      salt: defaults.salt,
      sugar: defaults.sugar,
      oil: defaults.oil,
    },
  },
  napoletansk: {
    label: "Napoletansk",
    hint: "Myk og luftig. Bare mel, vann, salt og gjær",
    // Soft and airy, baked very hot. Traditionally only flour, water, salt and yeast.
    values: { ballWeight: 260, hydration: 62, salt: 3, sugar: 0, oil: 0 },
  },
  newyork: {
    label: "New York",
    hint: "Stor og tynn, litt seig. Olje og sukker gir farge",
    // Larger and thinner, a bit chewy. Oil and sugar give colour in a home oven.
    values: { ballWeight: 320, hydration: 62, salt: 2, sugar: 1.5, oil: 2.5 },
  },
  panne: {
    label: "Pannepizza",
    hint: "Tykk og luftig, stekes i form med olje",
    // Thick and airy in a pan: wetter dough and more oil.
    values: { ballWeight: 400, hydration: 70, salt: 2.2, sugar: 0, oil: 3 },
  },
};

// The dropdown's options, made from the list above.
// Object.entries turns { klassisk: {...}, ... } into [["klassisk", {...}], ...].
export const pizzaStyleOptions: SelectOption[] = Object.entries(
  pizzaStyles,
).map(([value, style]) => ({ value, label: style.label }));

// ---------------------------------------------------------------------------
// Yeast
// ---------------------------------------------------------------------------

// The values ("fersk", "tørr") are the keys in yeastStrength in pizza/yeast.ts.
// Sourdough is hidden for now: a starter also contains flour and water,
// so it needs its own calculation before it can come back.
export const yeastOptions: SelectOption[] = [
  { value: "fersk", label: "Fersk gjær" },
  { value: "tørr", label: "Tørrgjær" },
];

// Two ways to work out the yeast amount (see idyPercent in pizza/yeast.ts),
// with the hint shown under the tags. Same pattern as pizzaStyles.
const yeastModels: Record<string, { label: string; hint: string }> = {
  hjemme: {
    label: "Hjemmeoppskrift",
    hint: "Tilpasset husoppskriften: 3 g tørrgjær, 3 t, 24 °C",
  },
  forum: {
    label: "Forum-basert",
    hint: "Basert på gjærtabellen fra Pizza Making Forum",
  },
};

export const yeastModelOptions: SelectOption[] = Object.entries(
  yeastModels,
).map(([value, model]) => ({ value, label: model.label }));

export function yeastModelHint(model: string) {
  return yeastModels[model]?.hint;
}

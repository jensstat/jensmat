import { useState } from "react";
import FieldGroup from "../components/FieldGroup";
import NumberField from "../components/NumberField";
import ResultPanel from "../components/ResultPanel";
import type { ResultRow } from "../components/ResultPanel";
import SelectField from "../components/SelectField";
import type { SelectOption } from "../components/SelectField";

// Everything below is outside the component: it never changes,
// so it doesn't need to be made again on every render.

const pizzaStyleOptions: SelectOption[] = [
  { value: "klassisk", label: "Klassisk (hjemmeovn)" },
  { value: "napoletansk", label: "Napoletansk" },
  { value: "newyork", label: "New York" },
  { value: "panne", label: "Pannepizza" },
];

// The values ("fersk", "tørr", "surdeig") are the keys in yeastStrength below.
const yeastOptions: SelectOption[] = [
  { value: "fersk", label: "Fersk gjær" },
  { value: "tørr", label: "Tørrgjær" },
  { value: "surdeig", label: "Surdeig" },
];

// All the settings on the page. One object instead of ten separate states,
// so the whole set can be passed to the calculation in one go.
interface PizzaSettings {
  pizzaStyle: string;
  pizzaCount: number;
  ballWeight: number;
  hydration: number;
  yeastType: string;
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
const defaults: PizzaSettings = {
  pizzaStyle: "klassisk",
  pizzaCount: 2,
  ballWeight: 372, // (450 + 275 + 10 + 5 + 3) / 2 = 371.5
  hydration: 61, // 275 / 450
  yeastType: "tørr",
  riseHours: 3,
  riseTemp: 20, // the recipe doesn't say; 3 h with this much yeast means room temperature
  salt: 2.2, // 10 / 450
  sugar: 1.1, // 5 / 450
  oil: 0,
};

// How much yeast you need compared with fresh yeast.
const yeastStrength: Record<string, number> = {
  fersk: 1,
  tørr: 1 / 3,
  surdeig: 10, // rough guess in grams of starter. Sourdough really needs its own calculation later.
};

// Fresh yeast in % of the flour weight. A simple model, tuned to the house recipe
// (3 h at 20 °C → 2 % fresh = 0.67 % dry = 3 g):
// - double the time → half the yeast
// - 10 °C colder → the yeast is half as fast → double the yeast
function freshYeastPercent(hours: number, tempC: number) {
  const speed = 2 ** ((tempC - 20) / 10);
  return 6 / (hours * speed);
}

// Turns the settings into grams for each ingredient.
// A "pure" function: the same settings always give the same result, and it doesn't touch React.
function calculateDough(s: PizzaSettings): ResultRow[] {
  // An empty field gives NaN ("Not a Number"), and 0 hours would mean dividing by zero.
  // Then there's nothing sensible to show, so return no rows.
  const numbers = [
    s.pizzaCount,
    s.ballWeight,
    s.hydration,
    s.riseHours,
    s.riseTemp,
    s.salt,
    s.sugar,
    s.oil,
  ];
  if (numbers.some((n) => Number.isNaN(n)) || s.riseHours <= 0) {
    return [];
  }

  const yeastPercent =
    freshYeastPercent(s.riseHours, s.riseTemp) * yeastStrength[s.yeastType];

  const totalDough = s.pizzaCount * s.ballWeight;
  // Everything is a % of the flour: flour × (100 % + all the other %) = total dough.
  const totalPercent =
    100 + s.hydration + s.salt + s.sugar + s.oil + yeastPercent;
  const flour = totalDough / (totalPercent / 100);
  // A small helper: how many grams is this % of the flour?
  const grams = (percent: number) => (flour * percent) / 100;

  const rows = [
    { label: "Mel", grams: Math.round(flour) },
    { label: "Vann", grams: Math.round(grams(s.hydration)) },
    { label: "Salt", grams: Math.round(grams(s.salt)) },
    { label: "Sukker", grams: Math.round(grams(s.sugar)) },
    { label: "Olje", grams: Math.round(grams(s.oil)) },
    // Yeast is a small amount, so keep one decimal (e.g. 2.7 g).
    { label: "Gjær", grams: Math.round(grams(yeastPercent) * 10) / 10 },
  ];

  // Hide ingredients you don't use (oil is 0 by default).
  return rows.filter((row) => row.grams > 0);
}

function PizzaCalculatorPage() {
  // settings = what's in the fields right now. setSettings changes it and redraws the page.
  // defaults is only used the first time; after that, React remembers the values.
  const [settings, setSettings] = useState(defaults);

  // Calculated on every render from the current settings.
  // Not stored in state: it can always be worked out from settings, so it can never be out of date.
  const rows = calculateDough(settings);

  return (
    // The section fills <main> and carries the white background.
    // The inner div is centred with the same width and padding as the header, so they line up.
    // Phones: one column. From lg: settings on the left, the result (360px) on the right.
    <section className="flex-1 bg-white font-mono">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16 lg:py-14">
        {/* Left column: the heading and the settings */}
        <div>
          <h1 className="font-display text-5xl md:text-6xl">Pizzakalkulator</h1>
          <p className="mt-2 text-neutral-600">
            Regn ut deigen til en perfekt pizza
          </p>
          <div className="mt-10 flex flex-col gap-10">
            <FieldGroup title="Deig">
              <SelectField
                label="Pizzatype"
                value={settings.pizzaStyle}
                onChange={(value) =>
                  setSettings({ ...settings, pizzaStyle: value })
                }
                options={pizzaStyleOptions}
              />
              <NumberField
                label="Antall pizzaer"
                unit="stk"
                value={settings.pizzaCount}
                onChange={(value) =>
                  setSettings({ ...settings, pizzaCount: value })
                }
                min={1}
                max={20}
                step={1}
              />
              <NumberField
                label="Vekt pr. bolle"
                unit="g"
                value={settings.ballWeight}
                onChange={(value) =>
                  setSettings({ ...settings, ballWeight: value })
                }
                min={150}
                max={400}
                step={1}
              />
              <NumberField
                label="Hydrering"
                unit="%"
                value={settings.hydration}
                onChange={(value) =>
                  setSettings({ ...settings, hydration: value })
                }
                min={50}
                max={80}
                step={1}
                hint="Vanlig: 60-70%"
              />
            </FieldGroup>

            <FieldGroup title="Gjær og heving">
              <SelectField
                label="Gjærtype"
                value={settings.yeastType}
                onChange={(value) =>
                  setSettings({ ...settings, yeastType: value })
                }
                options={yeastOptions}
              />
              <NumberField
                label="Hevetid"
                unit="t"
                value={settings.riseHours}
                onChange={(value) =>
                  setSettings({ ...settings, riseHours: value })
                }
                min={1}
                max={72}
                step={1}
                hint="Lengre heving gir mer smak"
              />
              <NumberField
                label="Hevetemperatur"
                unit="°C"
                value={settings.riseTemp}
                onChange={(value) =>
                  setSettings({ ...settings, riseTemp: value })
                }
                min={2}
                max={30}
                step={1}
                hint="Kjøleskap: 4 °C, rom: 20 °C"
              />
            </FieldGroup>

            {/* The percentages are of the flour weight, like hydration */}
            <FieldGroup title="Ekstra">
              <NumberField
                label="Salt"
                unit="%"
                value={settings.salt}
                onChange={(value) => setSettings({ ...settings, salt: value })}
                min={0}
                max={4}
                step={0.1}
                hint="Vanlig: 2,5-3%"
              />
              <NumberField
                label="Sukker"
                unit="%"
                value={settings.sugar}
                onChange={(value) => setSettings({ ...settings, sugar: value })}
                min={0}
                max={5}
                step={0.1}
                hint="Valgfritt, gir mer farge"
              />
              <NumberField
                label="Olje"
                unit="%"
                value={settings.oil}
                onChange={(value) => setSettings({ ...settings, oil: value })}
                min={0}
                max={6}
                step={0.5}
                hint="Napoletansk: 0%"
              />
            </FieldGroup>
          </div>
        </div>

        {/* Right column (under the settings on phones) */}
        <ResultPanel
          rows={rows}
          pizzaCount={settings.pizzaCount}
          ballWeight={settings.ballWeight}
        />
      </div>
    </section>
  );
}

export default PizzaCalculatorPage;

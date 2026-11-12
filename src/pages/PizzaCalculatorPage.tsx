import { useState } from "react";
import ChoiceTags from "../components/ChoiceTags";
import Container from "../components/Container";
import FieldGroup from "../components/FieldGroup";
import Instructions from "../components/Instructions";
import NumberField from "../components/NumberField";
import ResultPanel from "../components/ResultPanel";
import SelectField from "../components/SelectField";
import { calculateDough } from "../pizza/calculateDough";
import {
  defaults,
  isHouseRecipe,
  pizzaStyleOptions,
  pizzaStyles,
  yeastModelHint,
  yeastModelOptions,
  yeastOptions,
} from "../pizza/settings";
import type { PizzaSettings } from "../pizza/settings";

// The page only handles what you see: the fields, the result and the method.
// The data lives in pizza/settings.ts, and the maths in pizza/calculateDough.ts and pizza/yeast.ts.
function PizzaCalculatorPage() {
  // settings = what's in the fields right now. setSettings changes it and redraws the page.
  // defaults is only used the first time; after that, React remembers the values.
  const [settings, setSettings] = useState(defaults);

  // Changes only the fields you pass in, and keeps the rest.
  // prev = the settings right now. React hands it to us, so we always build on the latest values.
  // Used like this: update({ salt: 3 }) or update({ pizzaStyle: "panne", ...someValues })
  const update = (changes: Partial<PizzaSettings>) =>
    setSettings((prev) => ({ ...prev, ...changes }));

  // Calculated on every render from the current settings.
  // Not stored in state: it can always be worked out from settings, so it can never be out of date.
  const rows = calculateDough(settings);

  return (
    // The section fills <main> and carries the white background.
    // Container: the same width and padding as the header, so they line up.
    <section className="flex-1 bg-white font-mono">
      <Container>
        {/* The heading spans both columns */}
        <h1 className="font-display text-5xl md:text-6xl">Pizzakalkulator</h1>
        <p className="mt-2 text-neutral-600">
          Regn ut deigen til en perfekt pizza
        </p>
        {/* Back to the house recipe (defaults) after trying something else.
            Only shown when something has been changed. */}
        {!isHouseRecipe(settings) && (
          <button
            type="button"
            onClick={() => setSettings(defaults)}
            className="mt-4 border border-black px-4 py-2.5 text-sm uppercase transition-colors hover:bg-black hover:text-white focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-none"
          >
            Husoppskriften
          </button>
        )}

        {/* Phones: one column. From lg: settings on the left, the result (320px) on the right.
            Both columns start at the same height, so "Deig" and "Resultat" line up. */}
        <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-24">
          {/* Left column: the settings.
              (pizzaCount) => update({ pizzaCount }) is short for
              (value) => update({ pizzaCount: value }): when the name of the value and the
              field are the same, you only need to write it once. */}
          <div className="flex flex-col gap-12">
            <FieldGroup title="Deig">
              <SelectField
                label="Pizzatype"
                value={settings.pizzaStyle}
                // Saves the type and copies in its values (hydration, salt …) on top.
                onChange={(pizzaStyle) =>
                  update({ pizzaStyle, ...pizzaStyles[pizzaStyle].values })
                }
                options={pizzaStyleOptions}
                hint={pizzaStyles[settings.pizzaStyle].hint}
              />
              <NumberField
                label="Antall pizzaer"
                unit="stk"
                value={settings.pizzaCount}
                onChange={(pizzaCount) => update({ pizzaCount })}
                min={1}
                max={20}
                step={1}
              />
              <NumberField
                label="Vekt pr. bolle"
                unit="g"
                value={settings.ballWeight}
                onChange={(ballWeight) => update({ ballWeight })}
                min={150}
                max={400}
                step={1}
              />
              <NumberField
                label="Hydrering"
                unit="%"
                value={settings.hydration}
                onChange={(hydration) => update({ hydration })}
                min={50}
                max={80}
                step={1}
                hint="Vanlig: 60-70%"
              />
            </FieldGroup>

            <FieldGroup title="Gjær og heving">
              <ChoiceTags
                label="Gjærberegning"
                value={settings.yeastModel}
                onChange={(yeastModel) => update({ yeastModel })}
                options={yeastModelOptions}
                hint={yeastModelHint(settings.yeastModel)}
              />
              <SelectField
                label="Gjærtype"
                value={settings.yeastType}
                onChange={(yeastType) => update({ yeastType })}
                options={yeastOptions}
              />
              <NumberField
                label="Hevetid"
                unit="t"
                value={settings.riseHours}
                onChange={(riseHours) => update({ riseHours })}
                min={1}
                max={72}
                step={1}
                hint="Lengre heving gir mer smak"
              />
              <NumberField
                label="Hevetemperatur"
                unit="°C"
                value={settings.riseTemp}
                onChange={(riseTemp) => update({ riseTemp })}
                min={2}
                max={30}
                step={1}
                hint="Kjøleskap: 4 °C, rom: 24 °C"
              />
            </FieldGroup>

            {/* The percentages are of the flour weight, like hydration */}
            <FieldGroup title="Ekstra">
              <NumberField
                label="Salt"
                unit="%"
                value={settings.salt}
                onChange={(salt) => update({ salt })}
                min={0}
                max={4}
                step={0.1}
                hint="Vanlig: 2,5-3%"
              />
              <NumberField
                label="Sukker"
                unit="%"
                value={settings.sugar}
                onChange={(sugar) => update({ sugar })}
                min={0}
                max={5}
                step={0.1}
                hint="Valgfritt, gir mer farge"
              />
              <NumberField
                label="Olje"
                unit="%"
                value={settings.oil}
                onChange={(oil) => update({ oil })}
                min={0}
                max={6}
                step={0.5}
                hint="Gir mykere deig og mer farge"
              />
            </FieldGroup>
          </div>

          {/* Right column (under the settings on phones): the result, then the method */}
          <div className="flex flex-col gap-12">
            <ResultPanel
              rows={rows}
              pizzaCount={settings.pizzaCount}
              ballWeight={settings.ballWeight}
            />
            {/* Only when all fields are filled in, like the result (otherwise "NaN t") */}
            {rows.length > 0 && (
              <Instructions
                pizzaCount={settings.pizzaCount}
                ballWeight={settings.ballWeight}
                riseHours={settings.riseHours}
                riseTemp={settings.riseTemp}
              />
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default PizzaCalculatorPage;

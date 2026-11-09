import NumberField from "../components/NumberField";

function PizzaCalculatorPage() {
  return (
    // The grid fills <main> (flex-1) and the full width.
    // Phones: one column, so the panels stack. From lg: inputs take the rest, the recipe is 420px.
    <section className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_420px]">
      {/* Left panel: the heading and the settings */}
      <div className="bg-white px-6 py-10 lg:px-12 lg:py-12">
        <div className="max-w-2xl">
          <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
            Pizzakalkulator
          </h1>
          <p className="mt-2 text-stone-600">
            Regn ut deigen til en perfekt pizza
          </p>
          <div className="mt-10 flex flex-col gap-8">
            <fieldset>
              <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                Deig
              </legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <NumberField
                  label="Antall pizzaer"
                  unit="stk"
                  defaultValue={4}
                  min={1}
                  max={20}
                  step={1}
                />
                <NumberField
                  label="Vekt pr. bolle"
                  unit="g"
                  defaultValue={250}
                  min={150}
                  max={400}
                  step={5}
                />
                <NumberField
                  label="Hydrering"
                  unit="%"
                  defaultValue={65}
                  min={50}
                  max={80}
                  step={1}
                  hint="Vanlig: 60-70%"
                />
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                Gjær og heving
              </legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {/* Yeast type is a choice, not a number, so it needs another kind of field */}
                <p>Gjærtype</p>
                <NumberField
                  label="Hevetid"
                  unit="t"
                  defaultValue={24}
                  min={1}
                  max={72}
                  step={1}
                  hint="Lengre heving gir mer smak"
                />
                <NumberField
                  label="Hevetemperatur"
                  unit="°C"
                  defaultValue={4}
                  min={2}
                  max={30}
                  step={1}
                  hint="Kjøleskap: 4 °C, romtemp: 20 °C"
                />
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                Ekstra
              </legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {/* The percentages are of the flour weight, like hydration */}
                <NumberField
                  label="Salt"
                  unit="%"
                  defaultValue={2.8}
                  min={0}
                  max={4}
                  step={0.1}
                  hint="Vanlig: 2,5-3%"
                />
                <NumberField
                  label="Sukker"
                  unit="%"
                  defaultValue={0}
                  min={0}
                  max={5}
                  step={0.5}
                  hint="Valgfritt, gir mer farge"
                />
                <NumberField
                  label="Olje"
                  unit="%"
                  defaultValue={0}
                  min={0}
                  max={6}
                  step={0.5}
                  hint="Napoletansk: 0%"
                />
              </div>
            </fieldset>
          </div>
        </div>
      </div>
      {/* Right panel: the recipe. The panel keeps full height so the background reaches the footer. */}
      <div className="bg-amber-50 px-6 py-10 lg:px-12 lg:py-12">
        {/* Only this inner div is sticky, so the recipe stays visible while you scroll the settings. */}
        <div className="lg:sticky lg:top-28">
          <h2>Resultat</h2>
        </div>
      </div>
    </section>
  );
}

export default PizzaCalculatorPage;

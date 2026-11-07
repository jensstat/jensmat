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
                <p>Antall pizzaer: </p>
                <p>Vekt pr. bolle</p>
                <p> Hydrering</p>
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                Gjær og heving
              </legend>
              {/* Later: yeast type, rising time, where it rises */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <p>Gjærtype</p>
                <p>Hevetid</p>
                <p>Hevetemperatur</p>
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                Ekstra
              </legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <p>Salt</p>
                <p>Sukker</p>
                <p>Olje</p>
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

function HomePage() {
  return (
    // Outer layer: full-width background.
    // flex-1 makes the section grow and fill <main>, all the way down to the footer.
    <section className="flex flex-1 items-center bg-linear-to-br from-orange-100 to-amber-50 py-20">
      {/* Inner layer: same width and padding as the header, so the content lines up with it. */}
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center md:px-8">
        <h1 className="font-serif text-4xl font-bold tracking-tight md:text-6xl">
          Jens sin oppskriftbank
        </h1>
        <p className="max-w-xl text-lg text-stone-600">og pizza-kalkulator</p>
      </div>
    </section>
  );
}

export default HomePage;

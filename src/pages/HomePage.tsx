import { Link } from "react-router";

// The two ways into the site. The first is the main one (filled), the second is outlined.
const entries = [
  { label: "Oppskrifter", to: "/oppskrifter" },
  { label: "Pizzakalkulator", to: "/pizza" },
];

// Shared by both buttons: square, black line, centred text, red outline for keyboard focus.
const buttonBase =
  "border border-black px-6 py-3 text-center uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600";

function HomePage() {
  return (
    // The section fills <main> down to the footer, and centres its content vertically (justify-center).
    <section className="flex flex-1 flex-col justify-center bg-white font-mono">
      {/* Same width and padding as the header, so the heading starts under the logo.
          w-full: in a flex column, mx-auto alone would shrink the box to fit its content
          and centre it, leaving white space on both sides. */}
      <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8 lg:py-24">
        {/* As big as there's room for. leading-[0.9] pulls the two lines closer together,
            which suits a tall, narrow font like Anton. */}
        <h1 className="font-display text-5xl leading-[0.9] uppercase sm:text-7xl md:text-8xl lg:text-9xl">
          Jens sin oppskriftsbank
        </h1>

        {/* A thin line under the heading, with the subtitle and the buttons below it.
            Phones: stacked. From md: subtitle on the left, buttons on the right. */}
        <div className="mt-8 flex flex-col gap-6 border-t border-black pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-lg text-neutral-600">og pizzakalkulator</p>

          {/* Phones: full-width buttons, easy to tap. From sm: side by side. */}
          <div className="grid gap-3 sm:grid-cols-2">
            {entries.map((entry, index) => (
              <Link
                key={entry.to}
                to={entry.to}
                className={`${buttonBase} ${
                  index === 0
                    ? "bg-black text-white hover:border-red-600 hover:bg-red-600"
                    : "hover:bg-black hover:text-white"
                }`}
              >
                {entry.label} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomePage;

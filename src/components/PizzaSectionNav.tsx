import { scrollToSection, useActiveSection } from "./sectionScroll";

// The parts of the pizza page, in the order they come on a phone
const sections = [
  { id: "resultat", label: "Resultat" },
  { id: "fremgangsmate", label: "Fremgangsmåte" },
  { id: "deig", label: "Juster deigen" },
];

// Phones only: a bar under the header to jump between the result, the method and the
// settings, like the recipe page's, but in the pizza calculator's own look (mono,
// uppercase, black and white, square). The part you're reading is black.
function PizzaSectionNav() {
  const active = useActiveSection(sections.map((section) => section.id));

  return (
    // top-[var(--header-height)]: sticks right under the header (Header.tsx measures it)
    <nav
      aria-label="Deler av kalkulatoren"
      className="sticky top-[var(--header-height,0px)] z-[5] -mx-4 mt-6 border-b border-black bg-white px-4 py-3 lg:hidden print:hidden"
    >
      {/* flex-wrap: on a very narrow phone the buttons go onto two rows, never cut off */}
      <ul className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              type="button"
              onClick={() => scrollToSection(section.id)}
              aria-current={active === section.id ? "true" : undefined}
              className={`border border-black px-2.5 py-2 text-xs uppercase transition-colors ${
                active === section.id
                  ? "bg-black text-white"
                  : "bg-white hover:bg-neutral-100"
              }`}
            >
              {section.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default PizzaSectionNav;

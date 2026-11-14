import type { RecipeSection } from "../../recipes/display";
import { scrollToSection, useActiveSection } from "../sectionScroll";

interface RecipeSectionNavProps {
  sections: RecipeSection[];
  // What screen readers call the bar
  label?: string;
  // true: on every screen size (the editor in «Rediger»). Normally phones only
  everywhere?: boolean;
  // true: smaller buttons, so more of them fit on one row on a phone (the editor)
  compact?: boolean;
}

// Phones only: a bar that sticks just under the header, like Matprat's
// "Ingredienser | Slik gjør du": tap to jump, and the part you're reading is dark.
// Not shown for a recipe with fewer than two parts (nothing to jump between).
// Also used by «Rediger» (everywhere), to jump between the parts of the form.
function RecipeSectionNav({
  sections,
  label = "Deler av oppskriften",
  everywhere = false,
  compact = false,
}: RecipeSectionNavProps) {
  const active = useActiveSection(sections.map((section) => section.id));
  if (sections.length < 2) return null;

  return (
    // top-[var(--header-height)]: sticks right under the header (Header.tsx measures it).
    // z-[5]: above the page, below the header (z-10).
    <nav
      aria-label={label}
      className={`sticky top-[var(--header-height,0px)] z-[5] -mx-4 mt-8 border-b border-ink/10 bg-white px-4 py-3 md:-mx-8 md:px-8 print:hidden ${
        everywhere ? "" : "lg:hidden"
      }`}
    >
      {/* flex-wrap: on a very narrow phone the buttons go onto two rows,
          rather than being cut off at the screen edge */}
      <ul className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <li key={section.id} className="shrink-0">
            <button
              type="button"
              onClick={() => scrollToSection(section.id)}
              aria-current={active === section.id ? "true" : undefined}
              className={`rounded-full text-sm transition-colors ${
                compact ? "px-3 py-2" : "px-4 py-2.5"
              } ${
                active === section.id
                  ? "bg-ink text-white"
                  : "bg-panel hover:bg-ink/10"
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

export default RecipeSectionNav;

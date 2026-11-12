import { useEffect, useState } from "react";
import type { RecipeSection } from "../../recipes/display";

// How far below the top of the screen a section counts as "reached":
// the header (--header-height) plus this bar, about 5rem.
function stickyOffset() {
  const root = document.documentElement;
  const header =
    parseFloat(getComputedStyle(root).getPropertyValue("--header-height")) || 0;
  const rem = parseFloat(getComputedStyle(root).fontSize) || 16;
  return header + 5 * rem;
}

// Which section you're reading: the last one whose top has scrolled up under the bars.
// At the very bottom of the page it's the last one, even if it's too short to reach the top.
function useActiveSection(ids: string[]) {
  const key = ids.join(","); // a string, so the effect only restarts when the sections change
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const sectionIds = key.split(",");
    function update() {
      const offset = stickyOffset() + 1;
      let current = sectionIds[0];
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= offset)
          current = id;
      }
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) current = sectionIds[sectionIds.length - 1];
      setActive(current);
    }
    update();
    // passive: tells the browser we never stop the scrolling, so it stays smooth
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [key]);

  return active;
}

// Scroll to a section. The sections have a scroll margin (scroll-mt-…) as tall as the
// header and this bar, so the heading isn't hidden under them. Smooth, unless the
// person has asked their phone for less motion.
function scrollToSection(id: string) {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
}

interface RecipeSectionNavProps {
  sections: RecipeSection[];
}

// Phones only: a bar that sticks just under the header, like Matprat's
// "Ingredienser | Slik gjør du": tap to jump, and the part you're reading is dark.
// Not shown for a recipe with fewer than two parts (nothing to jump between).
function RecipeSectionNav({ sections }: RecipeSectionNavProps) {
  const active = useActiveSection(sections.map((section) => section.id));
  if (sections.length < 2) return null;

  return (
    // top-[var(--header-height)]: sticks right under the header (Header.tsx measures it).
    // z-[5]: above the page, below the header (z-10).
    <nav
      aria-label="Deler av oppskriften"
      className="sticky top-[var(--header-height,0px)] z-[5] -mx-5 mt-8 border-b border-ink/10 bg-white px-5 py-3 lg:hidden print:hidden"
    >
      <ul className="flex gap-2">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              type="button"
              onClick={() => scrollToSection(section.id)}
              aria-current={active === section.id ? "true" : undefined}
              className={`rounded-full px-4 py-2.5 text-sm transition-colors ${
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

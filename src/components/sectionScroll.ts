import { useEffect, useState } from "react";

// The logic behind the jump bars (RecipeSectionNav on the recipe page, PizzaSectionNav
// on the pizza calculator): which part of the page you're reading, and scrolling to one.
// Each bar has its own look; this is what they share.

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
export function useActiveSection(ids: string[]) {
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
export function scrollToSection(id: string) {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
}

import { useState } from "react";

const navLinks = [
  { label: "Hjem", href: "#" },
  { label: "Oppskrifter", href: "#" },
  { label: "Om meg", href: "#" },
];

function Header() {
  // State: React remembers which link is active between renders.
  // activeLink is the current value, setActiveLink changes it and makes React draw the header again.
  const [activeLink, setActiveLink] = useState("Hjem");

  return (
    // The outer <header> is full width: it carries the background, shadow and sticky.
    // z-10 keeps it above the page content when you scroll.
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      {/* The inner div holds the content and has the same width as <main> and the footer,
          so everything lines up. On phones the logo and menu stack (flex-col),
          from md and up they sit side by side (md:flex-row). */}
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8 md:py-6">
        {/* The logo goes to the front page, so it also makes "Hjem" active. */}
        <a
          href="#"
          onClick={() => setActiveLink("Hjem")}
          className="font-serif text-2xl tracking-tight md:text-3xl"
        >
          🍕 Min matnettside
        </a>

        <nav className="flex gap-6 text-base md:text-lg">
          {/* .map() turns each item in navLinks into an <a>.
              React needs a unique "key" on each item in a list to keep track of them. */}
          {navLinks.map((link) => {
            const isActive = activeLink === link.label;

            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setActiveLink(link.label)}
                // Tells screen readers (and Tailwind) which link is the current page.
                aria-current={isActive ? "page" : undefined}
                // {` `} = a template string: normal classes + ${...} picks extra classes.
                // Inactive links get a transparent border so the text doesn't move when clicked.
                className={`border-b-2 pb-1 transition-colors hover:text-orange-600 ${
                  isActive
                    ? "border-orange-600 font-semibold text-orange-600"
                    : "border-transparent"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default Header;

import { useEffect, useRef } from "react";
import { Link, NavLink } from "react-router";

// The menu: the text to show and the address each link goes to.
const navLinks = [
  { label: "Hjem", href: "/" },
  { label: "Oppskrifter", href: "/oppskrifter" },
  { label: "Pizza-kalkulator", href: "/pizza" },
];

function Header() {
  const headerRef = useRef<HTMLElement>(null);

  // The header's height as a CSS variable, --header-height, so things that stick just under
  // it (the recipe page's section bar on phones) know where to stop. Measured, not written
  // by hand: the height changes with the screen width (two rows on phones, one from md).
  // ResizeObserver tells us every time the header changes size.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty(
        "--header-height",
        `${header.offsetHeight}px`,
      );
    });
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return (
    // The outer <header> is full width: it carries the background, bottom line and sticky.
    // z-10 keeps it above the page content when you scroll.
    <header
      ref={headerRef}
      className="sticky top-0 z-10 bg-white border-b border-black print:hidden"
    >
      {/* The inner div holds the content and has the same width as <main> and the footer,
          so everything lines up. On phones the logo and menu stack (flex-col),
          from md and up they sit side by side (md:flex-row). */}
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8 md:py-6">
        {/* The logo goes to the front page.
            Link instead of <a>: changes page inside React, without reloading the whole site. */}
        <Link to="/" className="font-display text-3xl md:text-4xl uppercase">
          🍕 Jens matnettside
        </Link>

        <nav className="flex gap-4 sm:gap-6 font-mono text-sm uppercase md:text-base ">
          {/* .map() turns each item in navLinks into a NavLink.
              React needs a unique "key" on each item in a list to keep track of them. */}
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              // end: every address starts with "/", so without it "Hjem" would be active everywhere.
              end={link.href === "/"}
              // NavLink knows whether it's the current page (isActive),
              // and sets aria-current for screen readers by itself.
              // Inactive links get a transparent border so the text doesn't move when clicked.
              className={({ isActive }) =>
                `border-b-2 py-2 transition-colors hover:text-red-600 ${
                  isActive ? "border-black font-semibold" : "border-transparent"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;

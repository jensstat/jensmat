import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
}

// The shared page width: centred, with the same side padding as the header and footer,
// so a page's content lines up with the logo. w-full keeps it full width inside flex columns.
// Used by the pizza calculator and the "not found" and error pages. The front page and the
// overview write their own (different vertical padding), and the recipe page has its own layout.
function Container({ children }: ContainerProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8 lg:py-14">
      {children}
    </div>
  );
}

export default Container;

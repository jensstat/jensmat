import { Link, useLocation } from "react-router";
import { useLoginHint } from "../auth/loginHint";

// This runs once, when the file is loaded, and not every time the footer is drawn.
// React wants components to give the same result each time they run, so values like
// the current date are kept outside the component.
const year = new Date().getFullYear();

function Footer() {
  const isAdmin = useLoginHint();
  // Where you are now, so the login can bring you back here afterwards
  const location = useLocation();

  return (
    <footer className="font-mono border-t border-neutral-200 bg-white print:hidden">
      {/* Inside JSX, curly braces {} let you use normal JavaScript values, like year. */}
      <div className="mx-auto flex max-w-7xl justify-between gap-4 px-4 py-4 text-sm text-neutral-500 md:px-8">
        <span>© {year} Jens matnettside</span>
        {/* The admin's way in, on every page and in the app on the home screen (which
            has no address bar to type /logg-inn). Hidden when logged in: then
            «Logg ut» is in the admin bar. state.from: come back here afterwards */}
        {!isAdmin && (
          <Link
            to="/logg-inn"
            state={{ from: location.pathname + location.search }}
            className="hover:text-black"
          >
            Logg inn
          </Link>
        )}
      </div>
    </footer>
  );
}

export default Footer;

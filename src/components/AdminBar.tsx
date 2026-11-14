import { NavLink } from "react-router";
import { logOut } from "../auth/session";

// A thin dark bar at the very top, only for the admin (like a blog's admin bar):
// the quick way to post, the Datasjekk, and logging out. Shown by Header when the
// login note is there (auth/loginHint.ts). Visitors never see it.
function AdminBar() {
  const link = ({ isActive }: { isActive: boolean }) =>
    `py-1 hover:text-gold ${isActive ? "underline underline-offset-4" : ""}`;

  return (
    <div className="bg-ink font-mono text-xs text-white">
      <nav
        aria-label="Admin"
        className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-1.5 md:px-8"
      >
        <span className="text-white/50">Admin</span>
        <NavLink to="/ny-oppskrift" className={link}>
          + Ny oppskrift
        </NavLink>
        <NavLink to="/oppskrifter/datasjekk" className={link}>
          Datasjekk
        </NavLink>
        {/* ml-auto: pushed to the right edge */}
        <button
          type="button"
          onClick={() => logOut().catch(() => {})}
          className="ml-auto py-1 hover:text-gold"
        >
          Logg ut
        </button>
      </nav>
    </div>
  );
}

export default AdminBar;

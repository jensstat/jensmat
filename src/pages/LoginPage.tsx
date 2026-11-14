import { signInWithPopup, signOut } from "firebase/auth";
import { useState } from "react";
import { auth, googleLogin } from "../auth/firebase";
import { Link, useLocation, useNavigate } from "react-router";
import { useUser } from "../auth/useUser";
import Container from "../components/Container";

// The admin's way in: «Logg inn» in the footer (or /logg-inn). Not in the menu
// Where to go after logging in: the page the footer link was pressed on (its
// state.from), or the recipes. Only addresses on this site (starting with one /)
function returnAddress(state: unknown): string {
  const from =
    typeof state === "object" && state !== null && "from" in state
      ? state.from
      : undefined;
  return typeof from === "string" &&
    from.startsWith("/") &&
    !from.startsWith("//")
    ? from
    : "/oppskrifter";
}

function LoginPage() {
  const user = useUser();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const backTo = returnAddress(useLocation().state);

  // Opens Google's login window. No setUser: useUser hears the change.
  // signInWithPopup is the first thing that happens after the tap, with nothing
  // in between: an iPhone may block a pop-up that comes later (see auth/session.ts)
  async function logIn() {
    setError("");
    try {
      await signInWithPopup(auth, googleLogin);
      // Back to where you were, now with the admin bar. replace: the back button
      // shouldn't lead to the login page again
      navigate(backTo, { replace: true });
    } catch {
      setError("Innloggingen ble avbrutt. Prøv igjen.");
    }
  }

  return (
    <section className="flex-1 bg-white font-mono">
      <Container>
        <h1 className="font-display text-5xl uppercase md:text-6xl">
          Logg inn
        </h1>
        {user === undefined ? (
          <p className="mt-3 text-neutral-500">Sjekker …</p>
        ) : user ? (
          <div className="mt-3">
            <p>
              Logget inn som {user.displayName} ({user.email})
              <br />
              <span className="text-neutral-500">Bruker-id: {user.uid}</span>
            </p>
            {/* In the app there's no back button: never be stuck here */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={backTo}
                className="border border-black bg-black px-4 py-2 text-white hover:bg-white hover:text-black"
              >
                {backTo === "/oppskrifter" ? "Til oppskriftene" : "Tilbake"}
              </Link>
              <button
                onClick={() => signOut(auth)}
                className="border border-black px-4 py-2 hover:bg-black hover:text-white"
              >
                Logg ut
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={logIn}
            className="mt-6 border border-black px-4 py-2 hover:bg-black hover:text-white"
          >
            Logg inn med Google
          </button>
        )}
        {error && <p className="mt-3 text-red-600">{error}</p>}
      </Container>
    </section>
  );
}

export default LoginPage;

import { useState } from "react";
import { logIn, logOut } from "../auth/session";
import { useUser } from "../auth/useUser";
import Container from "../components/Container";

// Not in the menu: the admin's way in (bookmark /logg-inn)
function LoginPage() {
  const user = useUser();
  const [error, setError] = useState("");

  // Opens Google's login window (auth/session.ts, shared with the admin bar and
  // the editor). No setUser: useUser hears the change
  async function startLogIn() {
    setError("");
    try {
      await logIn();
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
            <button
              onClick={() => logOut()}
              className="mt-6 border border-black px-4 py-2 hover:bg-black hover:text-white"
            >
              Logg ut
            </button>
          </div>
        ) : (
          <button
            onClick={startLogIn}
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

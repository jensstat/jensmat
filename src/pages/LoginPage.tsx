import { signInWithPopup, signOut } from "firebase/auth";
import { useState } from "react";
import { auth, googleLogin } from "../auth/firebase";
import { useUser } from "../auth/useUser";
import Container from "../components/Container";
import { adminFetch } from "../auth/adminFetch";

// Not in the menu: the admin's way in (bookmark /logg-inn)
function LoginPage() {
  const user = useUser();
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState("");

  // Temporary (5b.6): does the API let me in? 404 = yes, 401 = no
  async function testApi() {
    const response = await adminFetch("/api/recipes?slug=finnes-ikke", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minutes: 10 }),
    });
    setAnswer(`${response.status} ${await response.text()}`);
  }

  // Opens Google's login window. No setUser: useUser hears the change
  async function logIn() {
    setError("");
    try {
      await signInWithPopup(auth, googleLogin);
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
              onClick={() => signOut(auth)}
              className="mt-6 border border-black px-4 py-2 hover:bg-black hover:text-white"
            >
              Logg ut
            </button>
            <button
              onClick={testApi}
              className="mt-6 ml-3 border border-black px-4 py-2 hover:bg-black hover:text-white"
            >
              Test API
            </button>
            {answer && <p className="mt-3 text-neutral-500">{answer}</p>}
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

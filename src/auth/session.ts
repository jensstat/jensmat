import { setLoginHint } from "./loginHint";

// Logging in and out from pages that don't load Firebase up front (the admin bar,
// the editor). Firebase is only downloaded when one of these runs: import() inside
// the function, not at the top of the file (see 5c.1).

// Google's login window. Afterwards the note is set at once, so the admin links show
// (on /logg-inn, useUser does this; here nothing is listening to Firebase)
export async function logIn(): Promise<void> {
  const [{ signInWithPopup }, { auth, googleLogin }] = await Promise.all([
    import("firebase/auth"),
    import("./firebase"),
  ]);
  await signInWithPopup(auth, googleLogin);
  setLoginHint(true);
}

export async function logOut(): Promise<void> {
  const [{ signOut }, { auth }] = await Promise.all([
    import("firebase/auth"),
    import("./firebase"),
  ]);
  await signOut(auth);
  setLoginHint(false);
}

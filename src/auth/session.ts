import { setLoginHint } from "./loginHint";

// Logging out from pages that don't load Firebase up front (the admin bar).
// Firebase is only downloaded when it runs: import() inside the function, not at
// the top of the file (see 5c.1).
//
// Logging IN is not here on purpose. Google's login is a pop-up window, and an
// iPhone only allows a pop-up straight after a tap. If Firebase is downloaded
// between the tap and the pop-up, Safari may block it. So the places that log in
// (LoginPage, «Logg inn igjen» in the editor) already have Firebase loaded, and call
// signInWithPopup directly, with nothing in between.

export async function logOut(): Promise<void> {
  const [{ signOut }, { auth }] = await Promise.all([
    import("firebase/auth"),
    import("./firebase"),
  ]);
  await signOut(auth);
  setLoginHint(false);
}

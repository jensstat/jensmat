import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// The connection to Firebase, set up once, like sanityClient.ts.
// These values aren't secret: they only name the project. The protection is
// the server's check in api/_auth.ts (step 5b.5).
const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});

// The login part: knows who is logged in, and remembers it after a reload
export const auth = getAuth(app);

// "Log in with Google", used by the login button
export const googleLogin = new GoogleAuthProvider();

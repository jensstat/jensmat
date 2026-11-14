import { auth } from "./firebase";

// Like fetch, but with your login, so the API (api/_auth.ts) lets you in.
// Fails if nobody is logged in.
export async function adminFetch(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  // Right after a page load, Firebase is still reading the saved login, and
  // currentUser is null until it's done. Wait for that first
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) throw new Error("Ikke logget inn");

  // A fresh token: Firebase renews it by itself when it's about to expire
  const token = await user.getIdToken();

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return fetch(url, { ...init, headers });
}

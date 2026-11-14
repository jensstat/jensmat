import { useSyncExternalStore } from "react";

// A note in this browser: "someone has logged in here". Only a hint, never proof:
// anyone can write it in the dev tools. All it does is make the site read fresh
// recipes (recipes.ts) and show the admin links («Ny oppskrift», «Rediger»), whose
// pages check the real login. The real lock is still the API's (api/_auth.ts).
// No Firebase import here, so every page can use it without downloading Firebase.

const storageKey = "innlogget";

// Has someone logged in in this browser? Blocked storage = no
export function hasLoginHint(): boolean {
  try {
    return localStorage.getItem(storageKey) === "ja";
  } catch {
    return false;
  }
}

// The components showing the note, told when it changes (see useLoginHint)
const listeners = new Set<() => void>();

// Write the note when someone logs in, and remove it when they log out
export function setLoginHint(loggedIn: boolean) {
  if (loggedIn === hasLoginHint()) return; // no change: nobody needs telling
  try {
    if (loggedIn) localStorage.setItem(storageKey, "ja");
    else localStorage.removeItem(storageKey);
  } catch {
    // Storage blocked: no note, so the site just behaves as for a visitor
  }
  listeners.forEach((listener) => listener());
}

// Start telling `listener` about changes; returns how to stop. Also listens to the
// browser's "storage" event, which fires when another tab changes localStorage.
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

// The note as a hook: the component draws again when you log in or out.
// useSyncExternalStore is React's way to read something that lives outside React
// (here localStorage): how to subscribe to changes, and how to read the value now.
export function useLoginHint(): boolean {
  return useSyncExternalStore(subscribe, hasLoginHint);
}

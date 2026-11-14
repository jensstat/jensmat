import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase";

// Who is logged in: undefined = not known yet, null = nobody, User = you.
// Firebase remembers the login in the browser, so it survives a reload.
export function useUser(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    // Firebase calls setUser now, and again on every log in or log out.
    // What it returns stops the listening when the component disappears.
    return onAuthStateChanged(auth, setUser);
  }, []);

  return user;
}

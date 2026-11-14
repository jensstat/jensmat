import { useCallback, useEffect, useState } from "react";

// A message that disappears by itself after a few seconds (shown with <Notice>).
// show("Lagret ✓") shows it; showing a new one starts the time again.
export function useNotice(
  initial?: string,
  seconds = 3,
): [string | undefined, (message: string) => void] {
  const [message, setMessage] = useState(initial);

  // When there's a message, start a timer that removes it. If a new message comes
  // first, React stops the old timer (the cleanup) and starts a new one
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(undefined), seconds * 1000);
    return () => clearTimeout(timer);
  }, [message, seconds]);

  // useCallback: the same function every time, so it's safe to pass on as a prop
  const show = useCallback((text: string) => setMessage(text), []);
  return [message, show];
}

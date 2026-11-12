import { useEffect, useState } from "react";

// "Behold skjermen på": asks the browser to keep the screen on while you cook,
// with the Screen Wake Lock API (navigator.wakeLock). Works in Safari on the iPhone
// (iOS 16.4 and newer), Chrome and Edge. Where it's missing, the switch isn't shown.
export const wakeLockSupported =
  typeof navigator !== "undefined" && "wakeLock" in navigator;

// [on, setOn]: like useState, but while `on` is true the screen is kept on.
// Not remembered: it's for this cooking session only, and turns off when you leave the page.
export function useWakeLock() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!on || !wakeLockSupported) return;
    // The lock we hold, in a small box: the async function puts it in, the cleanup takes it out
    const held: { lock?: WakeLockSentinel; stopped: boolean } = {
      stopped: false,
    };

    async function request() {
      try {
        const lock = await navigator.wakeLock.request("screen");
        held.lock = lock;
        // Turned off while we waited for the answer: let go at once
        if (held.stopped) await lock.release();
      } catch {
        // Refused (low battery, for example): the screen just turns off as normal
      }
    }

    // The browser lets go of the lock by itself when you switch app or tab,
    // so ask again when the page is visible again.
    function onVisibilityChange() {
      if (document.visibilityState === "visible") void request();
    }

    void request();
    document.addEventListener("visibilitychange", onVisibilityChange);
    // Cleanup: runs when the switch is turned off, or when you leave the page
    return () => {
      held.stopped = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void held.lock?.release();
    };
  }, [on]);

  return [on, setOn] as const;
}

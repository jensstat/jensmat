import { useWakeLock, wakeLockSupported } from "./useWakeLock";

// The "Behold skjermen på" switch above the steps, like Matprat's.
// A <button role="switch">: screen readers say "switch, on/off" (aria-checked).
// Not shown where the browser can't keep the screen on, or on paper.
function KeepScreenOn() {
  const [on, setOn] = useWakeLock();
  if (!wakeLockSupported) return null;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn(!on)}
      className="flex w-full items-center justify-between gap-4 bg-panel px-5 py-3.5 text-left text-base print:hidden"
    >
      Behold skjermen på
      {/* The track and the knob. The knob slides right when on (translate-x-5). */}
      <span
        aria-hidden="true"
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          on ? "bg-ink" : "bg-ink/20"
        }`}
      >
        <span
          className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-5" : ""
          }`}
        />
      </span>
    </button>
  );
}

export default KeepScreenOn;

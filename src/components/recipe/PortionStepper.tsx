interface PortionStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

// "[−] [2] [+] porsjoner": a white number box between two buttons, like Gladkokken's portion box.
// Controlled: the page holds the number.
function PortionStepper({ value, onChange, min = 1, max = 20 }: PortionStepperProps) {
  const button =
    "flex h-10 w-10 items-center justify-center border border-ink/20 bg-white text-xl leading-none transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink/20";

  return (
    <div className="flex items-center gap-3">
      <div className="flex">
        <button
          type="button"
          className={button}
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          aria-label="Færre porsjoner"
        >
          −
        </button>
        {/* aria-live: screen readers announce the new number when it changes */}
        <span
          aria-live="polite"
          className="flex h-10 min-w-12 items-center justify-center border-y border-ink/20 bg-white px-2 text-lg font-medium tabular-nums"
        >
          {value}
        </span>
        <button
          type="button"
          className={button}
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          aria-label="Flere porsjoner"
        >
          +
        </button>
      </div>
      <span className="text-base lg:text-lg">porsjoner</span>
    </div>
  );
}

export default PortionStepper;

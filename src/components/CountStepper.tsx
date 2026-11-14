interface CountStepperProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit: string; // after the number: "pizzaer"
}

// "[−] 2 [+] pizzaer": change a number with two buttons, no keyboard popping up on a
// phone. The pizza look (square, mono). border-current: the lines take the text
// colour, so it works both in the black result box (phones) and on white (desktop).
function CountStepper({ value, onChange, min, max, unit }: CountStepperProps) {
  const button =
    "flex h-11 w-11 items-center justify-center border border-current text-xl leading-none transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <div className="flex items-center gap-3">
      <div className="flex">
        <button
          type="button"
          className={button}
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          aria-label={`Færre ${unit}`}
        >
          −
        </button>
        {/* aria-live: screen readers hear the new number when it changes */}
        <span
          aria-live="polite"
          className="flex h-11 min-w-12 items-center justify-center border-y border-current px-2 font-display text-2xl tabular-nums"
        >
          {value}
        </span>
        <button
          type="button"
          className={button}
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          aria-label={`Flere ${unit}`}
        >
          +
        </button>
      </div>
      <span className="text-sm uppercase">{unit}</span>
    </div>
  );
}

export default CountStepper;

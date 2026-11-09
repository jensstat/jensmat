import FieldCard from "./FieldCard";

interface NumberFieldProps {
  label: string;
  unit: string;
  value: number;
  // A function the page gives us. We call it with the new number when the user types.
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  hint?: string;
}

function NumberField({
  label,
  unit,
  value,
  onChange,
  min,
  max,
  step,
  hint,
}: NumberFieldProps) {
  return (
    <FieldCard label={label} hint={hint}>
      <span className="flex items-baseline gap-1 w-full">
        <input
          type="number"
          inputMode="decimal"
          // An empty field is NaN in state; show it as empty instead of "NaN".
          value={Number.isNaN(value) ? "" : value}
          // valueAsNumber gives a real number (61), .value would give text ("61").
          onChange={(event) => onChange(event.target.valueAsNumber)}
          min={min}
          max={max}
          step={step}
          // The last three classes hide the browser's up/down arrows.
          className="w-full min-w-0 bg-transparent text-base tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span>{unit}</span>
      </span>
    </FieldCard>
  );
}

export default NumberField;

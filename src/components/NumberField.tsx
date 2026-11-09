interface NumberFieldProps {
  label: string;
  unit: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  hint?: string;
}

function NumberField({
  label,
  unit,
  defaultValue,
  min,
  max,
  step,
  hint,
}: NumberFieldProps) {
  return (
    <label className="block cursor-text rounded-xl border border-stone-200 bg-white p-4 transition hover:border-stone-300">
      <span className="block text-xs font-medium uppercase tracking-wider text-stone-500">
        {label}
      </span>
      <span className="mt-1 flex items-baseline gap-1">
        <input
          type="number"
          inputMode="decimal"
          defaultValue={defaultValue}
          min={min}
          max={max}
          step={step}
          className="w-full min-w-0 bg-transparent text-3xl font-semibold tabular-nums outline-none [appearance:textfield]
  [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span>{unit}</span>
      </span>
      {hint && (
        <span className="mt-1 block text-xs text-stone-400">{hint}</span>
      )}
    </label>
  );
}

export default NumberField;

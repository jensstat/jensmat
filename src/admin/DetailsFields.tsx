import {
  categories,
  cuisines,
  difficulties,
  occasions,
  proteins,
  tags,
  themes,
  type Recipe,
} from "../recipes/types";
import { fieldClass, labelClass } from "./editorStyles";

interface DetailsFieldsProps {
  recipe: Recipe;
}

// Portions, time, the dropdowns and the checkboxes. The choices come from the fixed
// lists in types.ts, like in the Studio and the API, so a new cuisine shows up here too.
function DetailsFields({ recipe }: DetailsFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* inputMode numeric: the number keyboard on phones.
            min and step: the browser refuses 0, -1 and 2.5 before the form is sent */}
        <NumberField
          name="servings"
          label="Porsjoner"
          value={recipe.servings}
        />
        <NumberField
          name="minutes"
          label="Tid (minutter)"
          value={recipe.minutes}
        />
        <ChoiceField
          name="category"
          label="Måltid"
          options={categories}
          value={recipe.category}
        />
        <ChoiceField
          name="protein"
          label="Hovedingrediens"
          options={proteins}
          value={recipe.protein}
        />
        <ChoiceField
          name="cuisine"
          label="Kjøkken"
          options={cuisines}
          value={recipe.cuisine}
        />
        <ChoiceField
          name="difficulty"
          label="Vanskelighetsgrad"
          options={difficulties}
          value={recipe.difficulty}
        />
      </div>

      <CheckboxField
        name="tags"
        label="Tilpasninger"
        options={tags}
        values={recipe.tags}
      />
      <CheckboxField
        name="themes"
        label="Passer til"
        options={themes}
        values={recipe.themes}
      />
      {/* What occasionsOf in types.ts does with none ticked */}
      <CheckboxField
        name="occasions"
        label="Ukedag / Helgemat"
        hint="Ingen valgt = ukedag"
        options={occasions}
        values={recipe.occasions}
      />
    </div>
  );
}

interface NumberFieldProps {
  name: string;
  label: string;
  value?: number;
}

function NumberField({ name, label, value }: NumberFieldProps) {
  return (
    <div>
      <label htmlFor={`edit-${name}`} className={labelClass}>
        {label}
      </label>
      <input
        id={`edit-${name}`}
        name={name}
        type="number"
        inputMode="numeric"
        min={1}
        step={1}
        defaultValue={value}
        className={fieldClass}
      />
    </div>
  );
}

interface ChoiceFieldProps {
  name: string;
  label: string;
  options: readonly string[];
  value?: string;
}

// A dropdown, with «—» (the value "") for "not chosen"
function ChoiceField({ name, label, options, value }: ChoiceFieldProps) {
  return (
    <div>
      <label htmlFor={`edit-${name}`} className={labelClass}>
        {label}
      </label>
      <select
        id={`edit-${name}`}
        name={name}
        defaultValue={value ?? ""}
        className={fieldClass}
      >
        <option value="">—</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

interface CheckboxFieldProps {
  name: string;
  label: string;
  hint?: string;
  options: readonly string[];
  values?: readonly string[];
}

// Several checkboxes with the same name: FormData.getAll(name) gives the ticked ones.
// <fieldset> + <legend>: a group's heading, read by screen readers with each box
function CheckboxField({
  name,
  label,
  hint,
  options,
  values = [],
}: CheckboxFieldProps) {
  return (
    // id: «Mangler» in the editor can jump here (edit-themes)
    <fieldset id={`edit-${name}`}>
      <legend className={labelClass}>
        {label}
        {hint && (
          <span className="ml-2 font-normal tracking-normal normal-case text-ink/60">
            ({hint})
          </span>
        )}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          // has-checked: the label is dark when its box is ticked
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2 border border-ink/30 px-3 py-1.5 has-checked:border-ink has-checked:bg-ink has-checked:text-white"
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              defaultChecked={values.includes(option)}
              className="accent-gold"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default DetailsFields;

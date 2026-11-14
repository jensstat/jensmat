import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { parseIngredientList, units } from "../recipes/parseIngredients";
import { getAllRecipes } from "../recipes/recipes";
import type { Ingredient } from "../recipes/types";
import { moveItem } from "./dragSort";
import {
  dragHandleClass,
  fieldBaseClass,
  fieldClass,
  labelClass,
  smallButtonClass,
} from "./editorStyles";
import {
  amountProblem,
  toValues,
  type IngredientValues,
} from "./ingredientLines";
import { useDragSort } from "./useDragSort";

interface IngredientsFieldProps {
  ingredients: Ingredient[];
  onChange: () => void; // tells the editor to count the changes again
}

// One line while editing, with an id that follows it when it's moved (like StepsField)
interface EditLine extends IngredientValues {
  id: number;
}

// The parts of a line, in the order of the fields. The name of each field in the
// form is "ingredient-" + the part: RecipeEditor reads them with getAll, one list per part
const parts = ["amount", "unit", "name", "note", "group"] as const;
type Part = (typeof parts)[number];

const placeholders: Record<Part, string> = {
  amount: "Mengde",
  unit: "Enhet",
  name: "Ingrediens",
  note: "Merknad",
  group: "Gruppe",
};

// The ingredients as lines you can change, add, remove and move, plus «Lim inn liste»:
// paste a whole list, read by the same parser as the Studio's (parseIngredients.ts)
function IngredientsField({ ingredients, onChange }: IngredientsFieldProps) {
  const [lines, setLines] = useState<EditLine[]>(() =>
    ingredients.map((ingredient, index) => ({
      id: index,
      ...toValues(ingredient),
    })),
  );
  const nextId = useRef(ingredients.length);
  const [pasted, setPasted] = useState("");
  const parsed = parseIngredientList(pasted);
  // The line to put the cursor in once it's drawn (a new one, or the next one)
  const focusId = useRef<number | null>(null);
  // Every ingredient name used in any recipe, as suggestions in the name field,
  // so "tomat" and "tomater" don't both happen (like the Studio's suggestions)
  const names = useIngredientNames();
  // Drag a line by ⠿ into a new place (the same as in StepsField)
  const drag = useDragSort(lines.length, (from, to) =>
    setLines(moveItem(lines, from, to)),
  );

  // After every change to the list: count the changes again, and move the cursor.
  // An effect, because a new line's field must exist before it can get the cursor
  useEffect(() => {
    onChange();
    if (focusId.current !== null) {
      document.getElementById(`ingredient-${focusId.current}-amount`)?.focus();
      focusId.current = null;
    }
  }, [lines, onChange]);

  function change(id: number, part: Part, text: string) {
    setLines(
      lines.map((line) => (line.id === id ? { ...line, [part]: text } : line)),
    );
  }

  // New lines at the end: an empty one (with the cursor in it), or the pasted ones
  function addLines(newLines: IngredientValues[], moveCursor = false) {
    if (moveCursor) focusId.current = nextId.current;
    setLines([
      ...lines,
      ...newLines.map((values) => ({ id: nextId.current++, ...values })),
    ]);
  }

  function remove(id: number) {
    setLines(lines.filter((line) => line.id !== id));
  }

  function move(index: number, by: -1 | 1) {
    setLines(moveItem(lines, index, index + by));
  }

  const emptyLine = { amount: "", unit: "", name: "", note: "", group: "" };

  // Enter in a line (it would send the form otherwise): to the next line, or a new
  // one after the last, so a list can be typed without touching the mouse
  function onEnter(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const next = lines[index + 1];
    if (next) {
      document.getElementById(`ingredient-${next.id}-amount`)?.focus();
    } else {
      addLines([emptyLine], true);
    }
  }

  function addPasted() {
    addLines(parsed.map(toValues));
    setPasted(""); // empty the box, so a second click can't add the same lines again
  }

  // The groups already used, as suggestions in the group field (<datalist>)
  const groups = [...new Set(lines.map((line) => line.group.trim()))].filter(
    Boolean,
  );

  return (
    <fieldset>
      <legend className={labelClass}>Ingredienser</legend>
      <p className="mt-1 text-sm text-ink/60">
        Bare navnet må fylles ut. Mengde: «2», «1,5», «½», «1/2», eller et spenn
        som «200-300».
      </p>

      <datalist id="ingredient-names">
        {names.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <datalist id="ingredient-units">
        {units.map((unit) => (
          <option key={unit} value={unit} />
        ))}
      </datalist>
      <datalist id="ingredient-groups">
        {groups.map((group) => (
          <option key={group} value={group} />
        ))}
      </datalist>

      <ol className="mt-3 space-y-4">
        {lines.map((line, index) => (
          <li
            key={line.id}
            ref={drag.itemRef(index)}
            style={drag.itemStyle(index)}
            className="border-b border-ink/10 pb-4"
          >
            {/* Phones: amount and unit side by side, the rest on their own rows.
                From sm: amount, unit, name and note on one row */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-[6.5rem_6rem_1fr_1fr]">
              {(["amount", "unit", "name", "note"] as const).map((part) => (
                <input
                  key={part}
                  id={`ingredient-${line.id}-${part}`}
                  name={`ingredient-${part}`}
                  onKeyDown={(event) => onEnter(event, index)}
                  // Suggestions: the names used before, and the usual units
                  list={
                    part === "name"
                      ? "ingredient-names"
                      : part === "unit"
                        ? "ingredient-units"
                        : undefined
                  }
                  value={line[part]}
                  onChange={(event) => {
                    // The amount is checked by the same reader that saves it
                    // ("2", "½", "200-300"). A message here stops «Lagre», and
                    // the browser shows it at the field
                    if (part === "amount") {
                      event.target.setCustomValidity(
                        amountProblem(event.target.value),
                      );
                    }
                    change(line.id, part, event.target.value);
                  }}
                  placeholder={placeholders[part]}
                  aria-label={`${placeholders[part]}, linje ${index + 1}`}
                  // The name is required: the browser stops «Lagre» and points to an empty one
                  required={part === "name"}
                  // No inputMode="decimal" on the amount: the phone's number
                  // pad has no dash, and a range needs one ("200-300")
                  className={`${fieldBaseClass} w-full min-w-0 ${
                    part === "name" || part === "note"
                      ? "col-span-2 sm:col-span-1"
                      : ""
                  }`}
                />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {/* Drag to move. Hidden from screen readers: ↑ ↓ do the same */}
              <span
                {...drag.handleProps(index)}
                aria-hidden="true"
                title="Dra for å flytte"
                className={dragHandleClass}
              >
                ⠿
              </span>
              <input
                name="ingredient-group"
                value={line.group}
                onChange={(event) =>
                  change(line.id, "group", event.target.value)
                }
                list="ingredient-groups"
                onKeyDown={(event) => onEnter(event, index)}
                placeholder="Gruppe (valgfri)"
                aria-label={`Gruppe, linje ${index + 1}`}
                className={`${fieldBaseClass} w-44 text-sm`}
              />
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Flytt linje ${index + 1} opp`}
                className={smallButtonClass}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === lines.length - 1}
                aria-label={`Flytt linje ${index + 1} ned`}
                className={smallButtonClass}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(line.id)}
                aria-label={`Fjern linje ${index + 1}`}
                className={smallButtonClass}
              >
                Fjern
              </button>
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() => addLines([emptyLine], true)}
        className={`${smallButtonClass} mt-4`}
      >
        + Legg til ingrediens
      </button>

      {/* «Lim inn liste», like in the Studio */}
      <div className="mt-6 bg-panel p-4">
        <label htmlFor="edit-paste" className={labelClass}>
          Lim inn liste
        </label>
        <p className="mt-1 text-sm text-ink/60">
          Én ingrediens per linje: «2 dl melk», «Løk, finhakket». En linje som
          slutter med kolon («Til sausen:») blir gruppe for linjene under.
        </p>
        <textarea
          id="edit-paste"
          rows={4}
          value={pasted}
          onChange={(event) => setPasted(event.target.value)}
          placeholder={"2 dl melk\n3 egg\nsalt"}
          className={`${fieldClass} text-base`}
        />
        <button
          type="button"
          onClick={addPasted}
          disabled={parsed.length === 0}
          className={`${smallButtonClass} mt-2 bg-white`}
        >
          {parsed.length > 0
            ? `Legg til ${parsed.length} linjer`
            : "Legg til linjer"}
        </button>
      </div>
    </fieldset>
  );
}

// The ingredient names from every recipe, sorted, each only once (tomat and Tomat
// count as one). Fetched when the editor opens; until then, and if it fails, no
// suggestions, which only means a little more typing
function useIngredientNames(): string[] {
  const [names, setNames] = useState<string[]>([]);
  useEffect(() => {
    let current = true; // false if the editor closes before the answer comes
    getAllRecipes()
      .then((recipes) => {
        const byLowerCase = new Map<string, string>();
        for (const recipe of recipes) {
          for (const { name } of recipe.ingredients) {
            const key = name.toLowerCase();
            if (!byLowerCase.has(key)) byLowerCase.set(key, name);
          }
        }
        const sorted = [...byLowerCase.values()].sort((a, b) =>
          a.localeCompare(b, "nb"),
        );
        if (current) setNames(sorted);
      })
      .catch(() => {});
    return () => {
      current = false;
    };
  }, []);
  return names;
}

export default IngredientsField;

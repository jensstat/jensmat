import { useEffect, useRef, useState } from "react";
import { moveItem } from "./dragSort";
import {
  dragHandleClass,
  fieldBaseClass,
  fieldClass,
  growClass,
  labelClass,
  smallButtonClass,
} from "./editorStyles";
import { splitSteps } from "./splitSteps";
import { useDragSort } from "./useDragSort";

interface StepsFieldProps {
  steps: string[];
  onChange: () => void; // tells the editor to count the changes again
}

// One step in the list while editing. id: a number that follows the step when it's
// moved, so React knows which <li> is which (the place in the list changes; the id doesn't)
interface EditStep {
  id: number;
  text: string;
}

// The steps as a list you can change: write, add, remove and move (drag by ⠿, or
// ↑ ↓), plus «Lim inn alle stegene»: a whole method at once, split by splitSteps.
// Unlike the other fields this one needs state, because the list itself changes
// (how many steps, and in what order). The texts are still read from the form
// (name="steps") when «Lagre» is pressed.
function StepsField({ steps, onChange }: StepsFieldProps) {
  const [items, setItems] = useState<EditStep[]>(() =>
    steps.map((text, index) => ({ id: index, text })),
  );
  // The next id for a new step. useRef: a value that's kept, but doesn't redraw
  const nextId = useRef(steps.length);
  // The step to put the cursor in once it's drawn (a new one)
  const focusId = useRef<number | null>(null);
  const [pasted, setPasted] = useState("");
  const split = splitSteps(pasted);
  const drag = useDragSort(items.length, (from, to) =>
    setItems(moveItem(items, from, to)),
  );

  // After every change to the list: count the changes again, and put the
  // cursor in a new step. An effect, because the new field must exist first
  useEffect(() => {
    onChange();
    if (focusId.current !== null) {
      document.getElementById(`step-${focusId.current}`)?.focus();
      focusId.current = null;
    }
  }, [items, onChange]);

  function change(id: number, text: string) {
    setItems(items.map((item) => (item.id === id ? { ...item, text } : item)));
  }

  function add() {
    focusId.current = nextId.current;
    setItems([...items, { id: nextId.current++, text: "" }]);
  }

  function remove(id: number) {
    setItems(items.filter((item) => item.id !== id));
  }

  // Moves a step one place up (-1) or down (+1)
  function move(index: number, by: -1 | 1) {
    setItems(moveItem(items, index, index + by));
  }

  // The pasted steps after the ones there are. Empty steps (an empty new one)
  // are dropped, so pasting into a new recipe doesn't leave a blank step 1
  function addPasted() {
    setItems([
      ...items.filter((item) => item.text.trim() !== ""),
      ...split.map((text) => ({ id: nextId.current++, text })),
    ]);
    setPasted(""); // empty the box, so a second click can't add them again
  }

  return (
    <fieldset>
      <legend className={labelClass}>Fremgangsmåte</legend>
      <ol className="mt-2 space-y-4">
        {items.map((item, index) => (
          <li
            key={item.id}
            ref={drag.itemRef(index)}
            style={drag.itemStyle(index)}
            className="flex gap-3"
          >
            <span className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center bg-gold font-serif text-lg font-semibold text-white">
              {index + 1}
            </span>
            <div className="flex-1">
              <textarea
                id={`step-${item.id}`}
                name="steps"
                rows={3}
                value={item.text}
                onChange={(event) => change(item.id, event.target.value)}
                aria-label={`Steg ${index + 1}`}
                className={`${fieldBaseClass} ${growClass} block w-full text-base leading-7`}
              />
              <div className="mt-2 flex items-center gap-2">
                {/* Drag to move. Hidden from screen readers: ↑ ↓ do the same */}
                <span
                  {...drag.handleProps(index)}
                  aria-hidden="true"
                  title="Dra for å flytte"
                  className={dragHandleClass}
                >
                  ⠿
                </span>
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Flytt steg ${index + 1} opp`}
                  className={smallButtonClass}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Flytt steg ${index + 1} ned`}
                  className={smallButtonClass}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={`Fjern steg ${index + 1}`}
                  className={smallButtonClass}
                >
                  Fjern
                </button>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={add}
        className={`${smallButtonClass} mt-4`}
      >
        + Legg til steg
      </button>

      {/* «Lim inn alle stegene»: the whole method in one box */}
      <div className="mt-6 bg-panel p-4">
        <label htmlFor="edit-paste-steps" className={labelClass}>
          Lim inn alle stegene
        </label>
        <p className="mt-1 text-sm text-ink/60">
          Skriv eller lim inn hele fremgangsmåten, med en tom linje mellom
          stegene. Nummererte steg («1.», «2)», «Steg 3») deles også opp, og
          numrene fjernes. Stegene legges etter dem som er der.
        </p>
        <textarea
          id="edit-paste-steps"
          rows={6}
          value={pasted}
          onChange={(event) => setPasted(event.target.value)}
          placeholder={
            "Stek løken i smør.\n\nTilsett tomatene, og la det koke i 10 min."
          }
          className={`${fieldClass} ${growClass} text-base`}
        />
        <button
          type="button"
          onClick={addPasted}
          disabled={split.length === 0}
          className={`${smallButtonClass} mt-2 bg-white`}
        >
          {split.length > 0 ? `Legg til ${split.length} steg` : "Legg til steg"}
        </button>
      </div>
    </fieldset>
  );
}

export default StepsField;

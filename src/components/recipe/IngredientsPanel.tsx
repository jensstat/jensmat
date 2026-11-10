import type { Ingredient } from "../../recipes/types";
import IngredientList from "./IngredientList";
import PortionStepper from "./PortionStepper";

export interface IngredientsPanelProps {
  ingredients: Ingredient[];
  servings: number; // the chosen number of portions
  baseServings: number; // the number of portions the recipe's amounts are for
  onServingsChange: (servings: number) => void;
  headingId?: string; // lets the phone dialog say "my name is this heading"
}

// The content of the ingredient panel: the heading, the portion selector between two dotted lines,
// and the list. Used twice: in the side panel on desktop, and in the full-screen panel on phones.
function IngredientsPanel({
  ingredients,
  servings,
  baseServings,
  onServingsChange,
  headingId,
}: IngredientsPanelProps) {
  return (
    <>
      <h2 id={headingId} className="text-base font-medium uppercase tracking-wider">
        Ingredienser
      </h2>
      <div className="mt-6 border-y-2 border-dotted border-ink/25 py-4">
        <PortionStepper value={servings} onChange={onServingsChange} />
      </div>
      <div className="mt-6">
        <IngredientList ingredients={ingredients} scale={servings / baseServings} />
      </div>
    </>
  );
}

export default IngredientsPanel;

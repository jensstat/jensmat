import type { Ingredient } from "../../recipes/types";
import IngredientList from "./IngredientList";
import PortionStepper from "./PortionStepper";

interface IngredientsPanelProps {
  ingredients: Ingredient[];
  servings: number; // the chosen number of portions
  // The number of portions the recipe's amounts are for.
  // undefined when the recipe has no portions yet: then there's no portion selector, and no scaling.
  baseServings?: number;
  onServingsChange: (servings: number) => void;
}

// The content of the ingredient panel: the heading, the portion selector between two dotted lines,
// and the list. Used twice: in the side panel on desktop, and in the page on phones and paper.
function IngredientsPanel({
  ingredients,
  servings,
  baseServings,
  onServingsChange,
}: IngredientsPanelProps) {
  return (
    <>
      <h2 className="text-base font-medium uppercase tracking-wider">
        Ingredienser
      </h2>
      {baseServings !== undefined && (
        <div className="mt-6 border-y-2 border-dotted border-ink/25 py-4">
          <PortionStepper value={servings} onChange={onServingsChange} />
        </div>
      )}
      <div className="mt-6">
        <IngredientList
          ingredients={ingredients}
          scale={baseServings === undefined ? 1 : servings / baseServings}
        />
      </div>
    </>
  );
}

export default IngredientsPanel;

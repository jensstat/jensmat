import { formatQuantity, groupIngredients } from "../../recipes/display";
import type { Ingredient } from "../../recipes/types";

interface IngredientListProps {
  ingredients: Ingredient[];
  // How much to multiply the amounts by. 1 = as in the recipe.
  // The page sets it from the portion selector: 4 portions of a 2-portion recipe → scale 2.
  scale?: number;
}

// The ingredients in groups ("Til dippen" …), one per line like Gladkokken: "300 g laks".
// The amount is in bold, so you can scan the amounts quickly while cooking.
function IngredientList({ ingredients, scale = 1 }: IngredientListProps) {
  const groups = groupIngredients(ingredients);

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        // The ungrouped ingredients have no title, so they get their own key
        <div key={group.title ?? "ungrouped"}>
          {group.title && (
            <h3 className="mb-2 text-sm font-medium uppercase tracking-wider">
              {group.title}
            </h3>
          )}
          <ul className="text-base lg:text-lg">
            {group.ingredients.map((ingredient, index) => {
              // Both ends of a range are scaled: 200–300 g for 2 → 400–600 g for 4
              const quantity = formatQuantity(
                ingredient.amount === undefined
                  ? undefined
                  : ingredient.amount * scale,
                ingredient.unit,
                ingredient.amountMax === undefined
                  ? undefined
                  : ingredient.amountMax * scale,
              );
              return (
                // index as key: names aren't unique (the same mustard can appear twice),
                // and the list never changes order, so the position is a safe key.
                <li
                  key={index}
                  className="border-b border-ink/10 py-2.5 last:border-b-0"
                >
                  {quantity && (
                    <span className="font-semibold">{quantity} </span>
                  )}
                  {ingredient.name}
                  {ingredient.note && (
                    <span className="text-ink/60">, {ingredient.note}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default IngredientList;

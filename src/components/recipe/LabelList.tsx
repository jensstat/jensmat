import { Link } from "react-router";
import type { RecipeLabel } from "../../recipes/display";
import { filterLink } from "../../recipes/filter";

interface LabelListProps {
  labels: RecipeLabel[];
}

const labelClass = "block rounded-full bg-panel px-3 py-1 text-sm";

// Small, soft labels, like "Fisk", "Italiensk", "Glutenfri". Shows nothing if the list is empty.
// A label that's a filter option links to the overview filtered on it ("Italiensk" →
// /oppskrifter?kjokken=Italiensk, "Rask" → "Rask (inntil 30 min)" in "Tid").
// A label without a group would be plain text.
function LabelList({ labels }: LabelListProps) {
  if (labels.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {labels.map(({ label, group, option }) => (
        <li key={label}>
          {group ? (
            <Link
              to={filterLink(group, option ?? label)}
              className={`${labelClass} transition-colors hover:bg-ink hover:text-white`}
            >
              {label}
            </Link>
          ) : (
            <span className={labelClass}>{label}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default LabelList;

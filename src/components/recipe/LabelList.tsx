interface LabelListProps {
  labels: string[];
}

// Small, soft labels, like "Fisk", "Rask", "Glutenfri". Shows nothing if the list is empty.
// Used on the recipe page now, and on the recipe cards later.
function LabelList({ labels }: LabelListProps) {
  if (labels.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {labels.map((label) => (
        <li key={label} className="rounded-full bg-panel px-3 py-1 text-sm">
          {label}
        </li>
      ))}
    </ul>
  );
}

export default LabelList;

import type { ReactNode } from "react";

interface FieldGroupProps {
  title: string;
  children: ReactNode;
}

// A titled group of fields, as a list with thin lines between the rows.
// divide-y draws lines between the children, border-y adds one above and below the group.
function FieldGroup({ title, children }: FieldGroupProps) {
  return (
    <fieldset>
      <legend className="mb-4 font-display text-2xl uppercase">{title}</legend>
      <div className="divide-y divide-neutral-200 border-y border-neutral-200">
        {children}
      </div>
    </fieldset>
  );
}

export default FieldGroup;

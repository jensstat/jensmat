import { useState } from "react";

interface RecipeActionsProps {
  // Given only to the admin: shows «Rediger» (RecipePage)
  onEdit?: () => void;
  // A draft of «Rediger» is waiting in this browser (admin/draft.ts)
  hasDraft?: boolean;
}

// "Skriv ut" and "Kopier lenke" under the photo, like Gladkokken's row of actions.
// Plus «Rediger» for the admin.
function RecipeActions({ onEdit, hasDraft = false }: RecipeActionsProps) {
  // true for a couple of seconds after the link is copied, so the button can say "Lenke kopiert".
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // The browser can refuse access to the clipboard. Then nothing happens, rather than an error.
    }
  }

  const action = "flex items-center gap-2 transition-colors hover:text-gold";

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-base lg:text-lg print:hidden">
      <button type="button" onClick={() => window.print()} className={action}>
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          aria-hidden="true"
        >
          <path
            d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"
            strokeLinejoin="round"
          />
        </svg>
        Skriv ut
      </button>
      <button type="button" onClick={copyLink} className={action}>
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          aria-hidden="true"
        >
          <path
            d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"
            strokeLinecap="round"
          />
        </svg>
        {/* aria-live: screen readers hear "Lenke kopiert" when it changes */}
        <span aria-live="polite">
          {copied ? "Lenke kopiert" : "Kopier lenke"}
        </span>
      </button>
      {onEdit && (
        <button type="button" onClick={onEdit} className={action}>
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            aria-hidden="true"
          >
            <path
              d="M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4"
              strokeLinejoin="round"
            />
          </svg>
          {hasDraft ? "Rediger (utkast)" : "Rediger"}
        </button>
      )}
    </div>
  );
}

export default RecipeActions;

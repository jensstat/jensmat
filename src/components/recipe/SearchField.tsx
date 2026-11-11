import { useId, useRef } from "react";
import { CloseIcon, SearchIcon } from "../icons";

interface SearchFieldProps {
  value: string; // the text as typed (the cleaning happens in filterRecipes)
  onChange: (value: string) => void;
}

// The search field on the overview: a magnifying glass on the left, and a ✕ on the right
// once something is typed. Controlled: the page holds the text (filters.query).
function SearchField({ value, onChange }: SearchFieldProps) {
  // A handle on the field, so the ✕ button can put the cursor back in it
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  function clear() {
    onChange("");
    inputRef.current?.focus();
  }

  return (
    // min-w-0: lets the field shrink next to the Filter button on narrow phones
    <div className="relative min-w-0 flex-1">
      {/* The label is for screen readers; the shorter placeholder is for everyone else */}
      <label htmlFor={id} className="sr-only">
        Søk etter oppskrift eller ingrediens
      </label>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-ink/50" />
      {/* text-base (16px): smaller text makes iPhones zoom in when you tap the field.
          The last class hides the browser's own ✕, since we have our own. */}
      <input
        ref={inputRef}
        id={id}
        type="search"
        enterKeyHint="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Søk i oppskrifter"
        className="w-full border border-ink/20 bg-white py-3 pr-11 pl-11 text-base placeholder:text-ink/45 focus:border-ink focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Tøm søket"
          className="absolute top-1/2 right-0.5 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-ink/50 transition-colors hover:text-ink"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export default SearchField;
